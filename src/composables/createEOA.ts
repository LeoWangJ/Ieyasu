import { ethers } from 'ethers'
export const createEOA = () => {
  const myEOA = ethers.Wallet.createRandom()
  console.log(myEOA)
}
