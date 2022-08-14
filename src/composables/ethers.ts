import { ethers } from 'ethers'

export const getEthers = async () => {
  const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum)
  const accounts = await ethereumProvider.listAccounts()
  const signer = ethereumProvider.getSigner()
  const { chainId } = await ethereumProvider.getNetwork()

  return {
    ethereumProvider,
    provider: ethereumProvider.provider,
    signer,
    account: accounts[0],
    chainId
  }
}
