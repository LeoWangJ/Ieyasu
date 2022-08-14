<script setup lang="ts">
import { onMounted, ref } from 'vue'
import ERC725js from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json'
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json'
import { getEthers } from '@/composables/ethers'
import { ethers } from 'ethers'
import { INTERFACEID, LOCATION } from '@/utils/config'
import TokenAssets from './TokenAssets.vue'
import NFTAssets from './NFTAssets.vue'
import type { ReceivedTokens } from '@/utils/types'

const receivedAssets = ref<string[]>([])
const receivedTokens = ref<ReceivedTokens[]>([])
const receivedNFTTokens = ref<ReceivedTokens[]>([])
onMounted(async () => {
  const { provider, account, ethereumProvider } = await getEthers()
  const controller = new ERC725js(LSP5ReceivedAssetsSchema as ERC725JSONSchema[], account, provider)
  try {
    const LSP5ReceivedAssets = await controller.getData('LSP5ReceivedAssets[]')
    receivedAssets.value = LSP5ReceivedAssets.value as string[]
  } catch (e) {
    // TODO EOA
  }
  receivedAssets.value.forEach(async (address) => {
    const LSP8IdentifiableDigitalAssetContract = new ethers.Contract(address, LSP8IdentifiableDigitalAsset.abi, ethereumProvider)

    const [isLSP7, isLSP8] = await Promise.all([
      LSP8IdentifiableDigitalAssetContract.supportsInterface(INTERFACEID.LSP7DigitalAsset),
      LSP8IdentifiableDigitalAssetContract.supportsInterface(INTERFACEID.LSP8IdentifiableDigitalAsset)
    ])
    if (isLSP8) {
      const tokenIds = await LSP8IdentifiableDigitalAssetContract.tokenIdsOf(account)
      tokenIds.forEach((tokenId:string) => {
        receivedNFTTokens.value.push({
          address,
          tokenId
        })
      })
    } else if (isLSP7) {
      receivedTokens.value.push({
        address,
        tokenId: null
      })
    }
  })
})
</script>

<template>
  <div v-if="receivedTokens.length">
    <p class="m-2">TOKENs</p>
    <TokenAssets
      :location="LOCATION.received"
      :address="item.address"
      v-for="(item,index) in receivedTokens"
      :key="index">
    </TokenAssets>
  </div>
  <div v-if="receivedNFTTokens.length">
    <p class="m-2">NFTs</p>
    <NFTAssets
      :location="LOCATION.received"
      :address="item.address"
      :tokenId="item.tokenId"
      v-for="(item,index) in receivedNFTTokens"
      :key="index">
    </NFTAssets>
  </div>
</template>
