import { ethers, Signer } from 'ethers'
import { LSPFactory } from '@lukso/lsp-factory.js'
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json'
import LSP1UniversalReceiverDelegateVault from '@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateVault.json'
import { RPC_URLS, CHAIN_IDS } from '@/utils/config'
import { ERC725YKeys } from '@lukso/lsp-smart-contracts/constants.js'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import LSP6KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json'

export const createEOA = () => {
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
  } catch (error:any) {
    console.log('Failed to deploy in TX:', error.transactionHash)
    throw error
  }
}
export const createMyVault = async (address:string, signer:Signer) => {
  const myVault = new ethers.ContractFactory(LSP9Vault.abi, LSP9Vault.bytecode, signer)

  try {
    const contract = await myVault.deploy(address, { gasLimit: 1000000 })
    const transaction = await contract.deployTransaction.wait()
    return { ...contract, contractAddress: transaction.contractAddress }
  } catch (error:any) {
    console.log('Failed to deploy in TX:', error.transactionHash)
    throw error
  }
}

export const settingURDAddressInStorage = async (account:string, signer:Signer) => {
  const URD_DATA_KEY = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate

  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const deployVault:any = await createMyVault(account, signer)

  console.log('deploy:', deployVault)
  const deployURD = await createURD(account, signer)
  console.log('deployURD:', deployURD)

  // const recipient = await deployVault['setData(bytes32,bytes)'](URD_DATA_KEY, deployURD.contractAddress, {
  //   gasLimit: 300_0000
  // }) // Any other information can be stored here
  const setDataPayload = await deployVault.interface.encodeFunctionData('setData(bytes32,bytes)', [URD_DATA_KEY, deployURD.contractAddress])
  const executePayload = await myUP.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, deployVault.contractAddress, 0, setDataPayload])
  // const tx = await myUP.execute(0, deployVault.contractAddress, 0, setDataPayload, {
  //   gasLimit: 300_0000
  // })
  const recipient = await executeByKM({
    account,
    signer,
    executePayload,
    privateKey: process.env.VUE_APP_PRIVATE_KEY as string
  })
  return { hash: recipient.hash, address: deployVault.contractAddress }
}
interface ExecuteByKMParameter{
  account:string
  signer:Signer
  executePayload:string
  privateKey:string
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

export const setAddressPermission = async (account:string, myVaultAddress:string, signer:Signer, thirdPartyAddress:string) => {
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  const allowedAddressesDataKey = ERC725YKeys.LSP6['AddressPermissions:AllowedAddresses'] + thirdPartyAddress.substring(2)
  const abiCoder = new ethers.utils.AbiCoder()
  const arrayOfAddresses = abiCoder.encode(['address'], [myVaultAddress])
  const setDataPayload = await myUP.interface.encodeFunctionData('setData(bytes32,bytes)', [allowedAddressesDataKey, arrayOfAddresses])

  const myKeyManagerAddress = await myUP.owner()

  const PRIVATE_KEY = '0x...'
  const provider = ethers.providers.getDefaultProvider(RPC_URLS.L16)
  const myEOA = new ethers.Wallet(PRIVATE_KEY, provider)
  const myKM = new ethers.Contract(myKeyManagerAddress, LSP6KeyManager.abi, myEOA)
  const recipient = await myKM.execute(setDataPayload, {
    gasLimit: 300_0000
  })
  return recipient
}
