import { BLOCK_EXPLORER_URLS, CHAIN_IDS, RPC_URLS } from './config'
import { ethers } from 'ethers'
export async function addLuksoL16Testnet () {
  try {
    // Open request to add custom network
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: CHAIN_IDS.L16_HEX,
          chainName: 'LUKSO L16',
          nativeCurrency: {
            name: 'LUKSO',
            symbol: 'LYXt',
            decimals: 18
          },
          rpcUrls: [RPC_URLS.L16],
          blockExplorerUrls: [BLOCK_EXPLORER_URLS.L16]
        }
      ]
    })
  } catch (err) {
    console.error(err)
  }
}

export async function isLuksoNetwork ():Promise<boolean> {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const { chainId } = await provider.getNetwork()

    if (chainId === CHAIN_IDS.L16) {
      return true
    }
    return false
  } catch (err) {
    return false
  }
}
