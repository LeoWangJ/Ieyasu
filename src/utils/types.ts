import { BooleanLiteral } from '@babel/types'

export interface ReceivedTokens {
  address: string
  tokenId: null | string
}

/**
 * @param isNFT - true: LSP8 , false: LSP7
 */
export interface NFT {
  name: string
  symbol: string
  icon: string
  balance?: number | string
  address: string
  isNFT?: boolean
  tokenId?: string | null
}
