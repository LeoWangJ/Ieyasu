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
  const myKeyManagerAddress = await myUP.owner()
  const provider = ethers.providers.getDefaultProvider(RPC_URLS.L16)
  const myEOA = new ethers.Wallet('private key', provider)

  const myKM = new ethers.Contract(myKeyManagerAddress, LSP6KeyManager.abi, myEOA)

  const recipient = await myKM.execute(executePayload, {
    gasLimit: 300_0000
  })
  return { hash: recipient.hash, address: deployVault.contractAddress }
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
