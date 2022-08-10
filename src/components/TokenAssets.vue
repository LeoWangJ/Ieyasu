<script setup lang="ts">
import ERC725js from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import { onMounted, reactive } from 'vue'
import { IPFS_GATEWAY_BASE_URL, LSP8MetadataJSONSchema } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { handlerIPFSImg } from '@/utils'
import { Cell } from 'vant'

const props = defineProps<{
  address: string
}>()

onMounted(async () => {
  await getAssets()
})
interface NFT {
  name: string
  symbol: string
  icon: string
}

const token = reactive<NFT>({
  name: '',
  symbol: '',
  icon: ''
})

const getAssets = async () => {
  const { provider } = await getEthers()
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
