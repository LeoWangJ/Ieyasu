<script setup lang="ts">
import { getEthers } from '@/composables/ethers'
import { COMMON_ABIS, INTERFACEID, IPFS_GATEWAY_BASE_URL, LOCATION } from '@/utils/config'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json'
import { ethers } from 'ethers'
import { onMounted, ref } from 'vue'
import TokenAssets from './TokenAssets.vue'
import NFTAssets from './NFTAssets.vue'
import { Button } from 'vant'
import { useRouter } from 'vue-router'
const router = useRouter()
const receivedAssets = ref<string[]>([])
const receivedTokens = ref<string[]>([])
const receivedNFTTokens = ref<string[]>([])
onMounted(async () => {
  const { account, provider, ethereumProvider } = await getEthers()
  const controller = new ERC725(LSP12IssuedAssetsSchema as ERC725JSONSchema[], account, provider, {
    ipfsGateway: IPFS_GATEWAY_BASE_URL
  })
  try {
    const LSP12IssuedAssets = await controller.getData('LSP12IssuedAssets[]')
    receivedAssets.value = LSP12IssuedAssets.value as string[]
  } catch (e) {
    const LSP12IssuedAssets = JSON.parse(localStorage.getItem('issuedAssets') as string)
    receivedAssets.value = LSP12IssuedAssets.value as string[]
  }

  receivedAssets.value.forEach(async (address) => {
    const supportsInterface = new ethers.Contract(address, [COMMON_ABIS.supportsInterface], ethereumProvider)

    const [isLSP7, isLSP8] = await Promise.all([
      supportsInterface.supportsInterface(INTERFACEID.LSP7DigitalAsset),
      supportsInterface.supportsInterface(INTERFACEID.LSP8IdentifiableDigitalAsset)
    ])

    try {
      if (isLSP7) {
        receivedTokens.value.push(address)
      } else if (isLSP8) {
        receivedNFTTokens.value.push(address)
      } else {
        console.error(`The contract: ${address} does not support LSP7 nor LSP8 interface id.`)
      }
    } catch (err) {
      console.error(`Could not find interface of the contract: ${address}`)
    }
  })
})
</script>

<template>
  <div class="flex ">
    <Button type="primary" @click="router.push({name: 'createToken'})">CREATE TOKEN</Button>
    <Button type="primary" @click="router.push({name: 'createNFTToken'})">CREATE NFT</Button>
  </div>
  <div v-if="receivedTokens.length">
    <p class="m-2">TOKENs</p>
    <TokenAssets
      :location="LOCATION.created"
      v-for="(address,index) in receivedTokens"
      :address="address"
      :key="index">
    </TokenAssets>
  </div>
  <div v-if="receivedNFTTokens.length">
    <p class="m-2">NFTs</p>
    <NFTAssets
      :location="LOCATION.created"
      v-for="(address,index) in receivedNFTTokens"
      :address="address"
      :key="index">
    </NFTAssets>
  </div>
</template>
