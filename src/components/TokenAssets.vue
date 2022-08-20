<script setup lang="ts">
import ERC725js from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP7DigitalAssetSchema from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import { onMounted, reactive, ref, shallowRef } from 'vue'
import type { Component } from 'vue'
import { IPFS_GATEWAY_BASE_URL, LOCATION } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { handlerIPFSImg } from '@/utils'
import { Cell, Dialog } from 'vant'
import { ethers } from 'ethers'
import MintToken from './MintToken.vue'
import SendAssets from './SendAssets.vue'
import { NFT } from '@/utils/types'
const props = defineProps<{
  address: string,
  location: string
}>()
const DialogComponent = Dialog.Component
onMounted(async () => {
  await getAssets()
})

const token = reactive<NFT>({
  name: '',
  symbol: '',
  icon: '',
  balance: 0,
  address: props.address,
  isNFT: false
})

const showDialog = ref(false)
const component:Component = shallowRef(undefined)
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
  token.balance = ethers.utils.formatEther(await lsp4DigitalAssetContract.balanceOf(account))
}

const openDialog = () => {
  const isCreated = props.location === LOCATION.created
  component.value = isCreated ? MintToken : SendAssets
  showDialog.value = true
}
</script>

<template>
  <div>
    <Cell size="large" inset center class="cell truncate" is-link :icon="token.icon" @click="openDialog">
      <template #title>
        {{ token.name }}<span v-if="token.symbol">({{ token.symbol }})</span>
        <span>{{ LOCATION.created === location ? `Supply` : `balanceOf` }}: {{ token.balance }}</span>
      </template>
    </Cell>
  </div>
  <DialogComponent v-model:show="showDialog" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-primary !rounded-none">
    <component :is="component" v-model:show="showDialog" :assets="token"></component>
  </DialogComponent>
</template>

<style scoped>
.cell {
  --van-cell-border-color: black;
}

:deep(.van-cell) {
  padding-left: 5px;
}

:deep(.van-cell__title) {
  margin-left: 10px;
}

:deep(.van-cell__left-icon) {
  font-size: 30px;
}
</style>
