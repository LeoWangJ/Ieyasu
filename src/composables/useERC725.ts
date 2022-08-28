import { ethers, Signer } from 'ethers'
import { LSPFactory } from '@lukso/lsp-factory.js'
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json'
import LSP1UniversalReceiverDelegateVault from '@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateVault.json'
import { RPC_URLS, CHAIN_IDS } from '@/utils/config'
import { ERC725YKeys } from '@lukso/lsp-smart-contracts/constants.js'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import LSP6KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json'
import LSP6Schema from '@erc725/erc725.js/schemas/LSP6KeyManager.json'
import { ERC725, ERC725JSONSchema } from '@erc725/erc725.js'
import { ExternalProvider } from '@ethersproject/providers'

interface ExecuteByKMParameter{
  account:string
  signer:Signer
  executePayload:string
  privateKey:string
}

interface Permissions {
  CHANGEOWNER?: boolean;
  CHANGEPERMISSIONS?: boolean;
  ADDPERMISSIONS?: boolean;
  SETDATA?: boolean;
  CALL?: boolean;
  STATICCALL?: boolean;
  DELEGATECALL?: boolean;
  DEPLOY?: boolean;
  TRANSFERVALUE?: boolean;
  SIGN?: boolean;
  SUPER_SETDATA?: boolean;
  SUPER_TRANSFERVALUE?: boolean;
  SUPER_CALL?: boolean;
  SUPER_STATICCALL?: boolean;
  SUPER_DELEGATECALL?: boolean;
}

interface KMPermission{
  account:string
  signer:Signer
  privateKey:string
  thirdPartyAddress:string
  permissions:Permissions
}

interface AddPermissionLength{
  account:string
  signer:Signer
  privateKey:string
  length:number
}
interface SetPermissionList{
  account:string
  signer:Signer
  privateKey:string
  thirdPartyAddress:string
  btyesLength:string
}

export const useERC725 = () => {
  const myEOA = ethers.Wallet.createRandom()
  return myEOA
}

export const loadEOA = (privateKey:string) => {
  const provider = ethers.getDefaultProvider()
  const myEOA = new ethers.Wallet(privateKey, provider)
  return myEOA
}

export const createUP = async (privateKey:string) => {
  const myEOA = loadEOA(privateKey)
  const lspFactory = new LSPFactory(RPC_URLS.L16, {
    deployKey: myEOA.privateKey,
    chainId: CHAIN_IDS.L16
  })
  const deployContracts = await lspFactory.UniversalProfile.deploy({
    controllerAddresses: [myEOA.address],
    lsp3Profile: {
      name: 'My Universal Profile',
      description: 'My Cool Universal Profile',
      tags: ['Public Profile'],
      links: []
    }
  })
  return deployContracts
}
export const createURD = async (address:string, signer:Signer) => {
  const myURDVault = new ethers.ContractFactory(LSP1UniversalReceiverDelegateVault.abi, LSP1UniversalReceiverDelegateVault.bytecode, signer)
  // deploy the universal receiver delegate Vault contract
  const contract = await myURDVault.deploy({ gasLimit: 1000000 })
  try {
    const transaction = await contract.deployTransaction.wait()
    return { ...contract, contractAddress: transaction.contractAddress }
  } catch (error) {
    console.log('Failed to deploy')
    throw error
  }
}
export const addVaultLength = async ({ account, signer, privateKey, length }:AddPermissionLength) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const indexLength = `${length + 1}`.length
  const btyesLength = ethers.constants.HashZero.slice(0, ethers.constants.HashZero.length - indexLength) + `${length + 1}`
  const arrayIndexLength = ethers.constants.HashZero.slice(0, ethers.constants.HashZero.length - indexLength) + `${length}`
  const VaultDataKey = ERC725YKeys.LSP10['LSP10Vaults[]'].length
  const setDataPayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [VaultDataKey, btyesLength])

  await executeByKM({
    account,
    signer,
    executePayload: setDataPayload,
    privateKey
  })
  return arrayIndexLength
}

export const setVaultList = async ({ account, signer, privateKey, thirdPartyAddress, btyesLength }:SetPermissionList) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const VaultIndex = ERC725YKeys.LSP10['LSP10Vaults[]'].index
  const VaultDataKey = VaultIndex + btyesLength.slice(VaultIndex.length)
  const setDataPayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [VaultDataKey, thirdPartyAddress])

  const recipient = await executeByKM({
    account,
    signer,
    executePayload: setDataPayload,
    privateKey
  })
  await recipient.wait()
  return recipient
}

export const createMyVault = async (address:string, signer:Signer) => {
  const myVault = new ethers.ContractFactory(LSP9Vault.abi, LSP9Vault.bytecode, signer)

  try {
    const contract = await myVault.deploy(address, { gasLimit: 1000000 })
    const transaction = await contract.deployTransaction.wait()
    return { ...contract, contractAddress: transaction.contractAddress }
  } catch (error) {
    console.log('Failed to deploy Vault')
    throw error
  }
}

export const settingURDAddressInStorage = async (account:string, signer:Signer, privateKey:string) => {
  const URD_DATA_KEY = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const deployVault = await createMyVault(account, signer)
  const deployURD = await createURD(account, signer)
  const setDataPayload = await deployVault.interface.encodeFunctionData('setData(bytes32,bytes)', [URD_DATA_KEY, deployURD.contractAddress])
  const executePayload = await myUP.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, deployVault.contractAddress, 0, setDataPayload])
  const recipient = await executeByKM({
    account,
    signer,
    executePayload,
    privateKey
  })
  return { hash: recipient.hash, address: deployVault.contractAddress }
}

export const executeByKM = async ({ account, signer, executePayload, privateKey }:ExecuteByKMParameter) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const myKeyManagerAddress = await myUP.owner()
  const provider = ethers.providers.getDefaultProvider(RPC_URLS.L16)
  const myEOA = new ethers.Wallet(privateKey, provider)
  const myKM = new ethers.Contract(myKeyManagerAddress, LSP6KeyManager.abi, myEOA)
  const recipient = await myKM.execute(executePayload, {
    gasLimit: 300_0000
  })
  return recipient
}

export const getPermissionList = async (account:string, provider:ExternalProvider) => {
  const erc725 = new ERC725(LSP6Schema as ERC725JSONSchema[], account, provider)
  const result = await erc725.getData('AddressPermissions[]')
  return result.value
}

export const addPermissionLength = async ({ account, signer, privateKey, length }:AddPermissionLength) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const indexLength = `${length + 1}`.length
  const btyesLength = ethers.constants.HashZero.slice(0, ethers.constants.HashZero.length - indexLength) + `${length + 1}`
  const arrayIndexLength = ethers.constants.HashZero.slice(0, ethers.constants.HashZero.length - indexLength) + `${length}`
  const allowedAddressesDataKey = ERC725YKeys.LSP6['AddressPermissions[]'].length
  const setDataPayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [allowedAddressesDataKey, btyesLength])

  await executeByKM({
    account,
    signer,
    executePayload: setDataPayload,
    privateKey
  })
  return arrayIndexLength
}

export const setPermissionList = async ({ account, signer, privateKey, thirdPartyAddress, btyesLength }:SetPermissionList) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const allowedAddressesIndex = ERC725YKeys.LSP6['AddressPermissions[]'].index
  const allowedAddressesDataKey = allowedAddressesIndex + btyesLength.slice(allowedAddressesIndex.length)
  const setDataPayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [allowedAddressesDataKey, thirdPartyAddress])

  const recipient = await executeByKM({
    account,
    signer,
    executePayload: setDataPayload,
    privateKey
  })
  await recipient.wait()
  return recipient
}

export const getAddressPermission = async (account:string, provider:ExternalProvider, address:string) => {
  const erc725 = new ERC725(LSP6Schema as ERC725JSONSchema[], account, provider)
  const addressPermission = await erc725.getData({
    keyName: 'AddressPermissions:Permissions:<address>',
    dynamicKeyParts: address
  })
  const decodedPermission = erc725.decodePermissions(addressPermission.value as string)
  return decodedPermission
}

export const setKMPermission = async ({ account, signer, privateKey, thirdPartyAddress, permissions }:KMPermission) => {
  const erc725 = new ERC725(LSP6Schema as ERC725JSONSchema[])
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const beneficiaryPermissions = erc725.encodePermissions(permissions)
  const data = erc725.encodeData([{
    keyName: 'AddressPermissions:Permissions:<address>',
    dynamicKeyParts: thirdPartyAddress,
    value: beneficiaryPermissions as string
  }])
  console.log('data:', data)
  const executePayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [data.keys[0], data.values[0]])
  const recipient = await executeByKM({
    account,
    signer,
    executePayload,
    privateKey
  })
  console.log('recipient:', recipient)
  return recipient
}

export const setVaultPermission = async (account:string, myVaultAddress:string, signer:Signer, privateKey:string, thirdPartyAddress:string) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const allowedAddressesDataKey = ERC725YKeys.LSP6['AddressPermissions:AllowedAddresses'] + thirdPartyAddress.substring(2)
  const abiCoder = new ethers.utils.AbiCoder()
  const arrayOfAddresses = abiCoder.encode(['address[]'], [[myVaultAddress]])
  const setDataPayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [allowedAddressesDataKey, arrayOfAddresses])
  const recipient = await executeByKM({
    account,
    signer,
    executePayload: setDataPayload,
    privateKey
  })
  return recipient
}
