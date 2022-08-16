import { ethers } from 'ethers'
import { LSPFactory } from '@lukso/lsp-factory.js'
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json'
import LSP1UniversalReceiverDelegateVault from '@lukso/lsp-smart-contracts/artifacts/LSP1UniversalReceiverDelegateVault.json'
import { RPC_URLS, CHAIN_IDS } from '@/utils/config'
import constants from '@lukso/lsp-smart-contracts/constants.js'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import LSP6KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json'

export const createEOA = () => {
  const myEOA = ethers.Wallet.createRandom()
  return myEOA
}

export const loadEOA = (privateKey:string) => {
  const myEOA = new ethers.Wallet(privateKey)
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
export const createURD = async (privateKey:string) => {
  const myEOA = loadEOA(privateKey)
  const myURDVault = new ethers.Contract(myEOA.address, LSP1UniversalReceiverDelegateVault.abi)

  // deploy the universal receiver delegate Vault contract
  await myURDVault.deploy({
    data: LSP1UniversalReceiverDelegateVault.bytecode
  }, {
    from: myEOA.address,
    gas: 5_000_000,
    gasPrice: '1000000000'
  })
}

export const createMyVault = async () => {
  const myEOA = createEOA()
  const universalProfile = await createUP(myEOA.privateKey)
  const myVault = new ethers.Contract(myEOA.address, LSP9Vault.abi)
  await myVault.deploy({
    data: LSP9Vault.bytecode,
    arguments: [universalProfile.LSP0ERC725Account?.address]
  }, {
    gas: 5_000_000,
    gasPrice: '1000000000'
  })
}

export const settingURDAddressInStorage = async (privateKey:string) => {
  const myEOA = loadEOA(privateKey)
  const URD_DATA_KEY = constants.ERC725YKeys.LSP0.LSP1UniversalReceiverDelegate
  const myUniversalProfileAddress = '0x..' // address of the UP
  const myVaultAddress = '0x..' // address of the Vault
  const myURDAddress = '0x..' // address of the URD of the Vault

  // create an instance of the Vault
  const myLSP9Vault = new ethers.Contract(myVaultAddress, LSP9Vault.abi)

  // create an instance of the UP
  const myUP = new ethers.Contract(myUniversalProfileAddress, UniversalProfile.abi)

  // encode setData Payload on the Vault
  const setDataPayload = await myLSP9Vault[
    'setData(bytes32,bytes)'
  ](URD_DATA_KEY, myURDAddress).encodeABI() // Any other information can be stored here

  // encode execute Payload on the UP
  const executePayload = await myUP.execute(
    0, // OPERATION CALL
    myVaultAddress,
    0, // value to transfer
    setDataPayload
  ).encodeABI()

  // getting the Key Manager address from UP
  const myKeyManagerAddress = await myUP.owner()

  // create an instance of the KeyManager
  const myKM = new ethers.Contract(myKeyManagerAddress, LSP6KeyManager.abi)

  // execute the executePayload on the KM
  await myKM.execute(executePayload, {
    from: myEOA.address,
    gasLimit: 600_000
  })
}
