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
  address: string,
  tokenId: string | null
}>()

onMounted(async () => {
  await getAssets()
})
interface NFT {
  name: string
  symbol: string
  icon: string
}

const nft = reactive<NFT>({
  name: '',
  symbol: '',
  icon: ''
})

const getAssets = async () => {
  const { provider } = await getEthers()
  const controller = new ERC725js([...LSP4DigitalAssetSchema, LSP8MetadataJSONSchema] as ERC725JSONSchema[], props.address, provider, {
    ipfsGateway: IPFS_GATEWAY_BASE_URL
  })
  console.log('controller:', controller)

  const metadata = await controller.fetchData([
    'LSP4TokenName',
    'LSP4TokenSymbol',
    {
      keyName: 'LSP8MetadataJSON:<bytes32>',
      dynamicKeyParts: props.tokenId
    },
    'LSP4Metadata'
  ])
  console.log(metadata)
  nft.name = metadata[0].value as string
  nft.symbol = metadata[1].value as string
  try {
    nft.icon = handlerIPFSImg(metadata[2].value.LSP4Metadata.icon[0].url)
  } catch (error) {
    nft.icon = handlerIPFSImg(metadata[3].value.LSP4Metadata.icon[0].url)
  }
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
      :icon="nft.icon"
      @click="openDialog">
      <template #title>
          {{ nft.name }}<span v-if="nft.symbol">({{nft.symbol}})</span>
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
