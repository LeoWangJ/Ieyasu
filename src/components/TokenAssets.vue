<script setup lang="ts">
import ERC725js from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP7DigitalAssetSchema from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import { onMounted, reactive } from 'vue'
import { IPFS_GATEWAY_BASE_URL } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { handlerIPFSImg } from '@/utils'
import { Cell } from 'vant'
import { ethers } from 'ethers'

const props = defineProps<{
  address: string
}>()

onMounted(async () => {
  await getAssets()
})
interface NFT {
  name: string
  symbol: string
  icon: string,
  balance: number | string
}

const token = reactive<NFT>({
  name: '',
  symbol: '',
  icon: '',
  balance: 0
})

const getAssets = async () => {
  const { provider, ethereumProvider, account } = await getEthers()
  const controller = new ERC725js(LSP4DigitalAssetSchema as ERC725JSONSchema[], props.address, provider, {
    ipfsGateway: IPFS_GATEWAY_BASE_URL
  })
  const metadata = await controller.fetchData([
    'LSP4TokenName',
    'LSP4TokenSymbol',
    'LSP4Metadata'
  ])
  token.name = metadata[0].value as string
  token.symbol = metadata[1].value as string
  token.icon = handlerIPFSImg(metadata[2].value.LSP4Metadata.icon[0].url)
  const lsp4DigitalAssetContract = new ethers.Contract(props.address, LSP7DigitalAssetSchema.abi, ethereumProvider)
  console.log('s', lsp4DigitalAssetContract)
  token.balance = ethers.utils.formatEther(await lsp4DigitalAssetContract.balanceOf(account))
}
const openDialog = () => {
  console.log('1')
}
</script>

<template>
  <div>
    <Cell
      size="large"
      inset
      center
      class="cell truncate"
      is-link
      :icon="token.icon"
      @click="openDialog">
      <template #title>
          {{ token.name }}<span v-if="token.symbol">({{token.symbol}})</span>
          <span>balanceOf: {{token.balance}}</span>
      </template>
  </Cell>
  </div>
</template>

<style scoped>
.cell{
  --van-cell-border-color: black;
}
:deep(.van-cell){
  padding-left: 5px;
}
:deep(.van-cell__title){
  margin-left: 10px;
}
:deep(.van-cell__left-icon){
  font-size:30px;
}
</style>
