import { IPFS_GATEWAY_BASE_URL } from './config'

export const handlerIPFSImg = (url:string, ipfs = IPFS_GATEWAY_BASE_URL) => {
  return url.replace('ipfs://', ipfs)
}
