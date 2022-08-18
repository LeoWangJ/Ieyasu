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
  const contract = await myURDVault.deploy(address, { gasLimit: 1000000 })
  try {
    return await contract.deployed()
  } catch (error:any) {
    console.log('Failed to deploy in TX:', error.transactionHash)
    throw error
  }
}

export const createMyVault = async (address:string, signer:Signer) => {
  const myVault = new ethers.ContractFactory(LSP9Vault.abi, LSP9Vault.bytecode, signer)
  const contract = await myVault.deploy(address, { gasLimit: 1000000 })
  try {
    return await contract.deployed()
  } catch (error:any) {
    console.log('Failed to deploy in TX:', error.transactionHash)
    throw error
  }
}

export const settingURDAddressInStorage = async (account:string, signer:Signer, myVaultAddress:string, myURDAddress:string) => {
  const URD_DATA_KEY = ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate
  // address of the UP
  // address of the Vault
  // address of the URD of the Vault
  const deployVault = await createMyVault(account, signer)
  console.log('deploy:', deployVault)
  const deployURD = await createMyVault(account, signer)
  console.log('deployURD:', deployURD)
  // create an instance of the Vault
  const myLSP9Vault = new ethers.ContractFactory(LSP9Vault.abi, LSP9Vault.bytecode, deployVault.signer)

  // create an instance of the UP
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  console.log('deployURD.address:', deployURD.address)
  const abi = ethers.utils.defaultAbiCoder

  // encode setData Payload on the Vault
  const setDataPayload = await deployVault[
    'setData(bytes32,bytes)'
  ](URD_DATA_KEY, deployURD.address)
  // const setDataPayload = await deployVault.interface.encodeFunctionData('setData(bytes32,bytes)', [URD_DATA_KEY, deployURD.address]) // Any other information can be stored here
  // console.log(abi.encode(['bytes'], [setDataPayload]))
  console.log('setDataPayload:', setDataPayload)
  // encode execute Payload on the UP
  // const executePayload = await myUP.execute(
  //   0, // OPERATION CALL
  //   deployVault.address,
  //   0, // value to transfer
  //   setDataPayload, {
  //     gasLimit: 100000000
  //   }
  // )
  // console.log('executePayload:', executePayload)
  // // getting the Key Manager address from UP
  // const myKeyManagerAddress = await myUP.owner()

  // // create an instance of the KeyManager
  // const myKM = new ethers.Contract(myKeyManagerAddress, LSP6KeyManager.abi, signer)

  // // execute the executePayload on the KM
  // await myKM.execute(executePayload, {
  //   gasLimit: 100000000
  // })
}

export const setAddressPermission = async (account:string, signer:Signer, thirdPartyAddress:string) => {
  const myVaultAddress = '0x..' // address of the Vault

  // create an instance of the UP
  const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)

  const allowedAddressesDataKey = // constructing the data key of allowed addresses
    ERC725YKeys.LSP6['AddressPermissions:AllowedAddresses'] +
    thirdPartyAddress.substring(2) // of the 3rd party

  // the data value holding the addresses that the 3rd party is allowed to interact with
  const arrayOfAddresses = ethers.utils.defaultAbiCoder.encode(['address'], [myVaultAddress])

  // encode setData payload on the UP
  const setDataPayload = await myUP['setData(bytes32,bytes)'](allowedAddressesDataKey, arrayOfAddresses)
  console.log('setDataPayload:', setDataPayload)

  // getting the Key Manager address from UP
  // const myKeyManagerAddress = await myUP.methods.owner()

  // // create an instance of the KeyManager
  // const myKM = new ethers.Contract(myKeyManagerAddress, LSP6KeyManager.abi)

  // // execute the setDataPayload on the KM
  // await myKM.execute(setDataPayload)
}
