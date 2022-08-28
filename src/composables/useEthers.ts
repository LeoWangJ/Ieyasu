import { ethers } from 'ethers'

export const getEthers = async () => {
  const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum)
  const accounts = await ethereumProvider.listAccounts()
  const signer = ethereumProvider.getSigner()
  const { chainId } = await ethereumProvider.getNetwork()
  const bytecode = await ethereumProvider.getCode(accounts[0])

  return {
    ethereumProvider,
    provider: ethereumProvider.provider,
    signer,
    account: accounts[0],
    chainId,
    isEOAccount: bytecode === '0x'
  }
}
