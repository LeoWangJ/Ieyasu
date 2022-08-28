<script setup lang="ts">
import ERC725js from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP7DigitalAssetSchema from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import { onMounted, reactive, ref, shallowRef } from 'vue'
import { IPFS_GATEWAY_BASE_URL, LSP8MetadataJSONSchema, LOCATION } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { handlerIPFSImg } from '@/utils'
import { Cell, Dialog } from 'vant'
import MintNFT from '@/views/created/MintNFT.vue'
import SendAssets from '@/views/received/SendAssets.vue'
import { NFT } from '@/utils/types'
import { ethers } from 'ethers'
import type { Component } from 'vue'
import { useStore } from 'vuex'
const store = useStore()

const emit = defineEmits(['update'])
const DialogComponent = Dialog.Component
const props = defineProps<{
  address: string,
  tokenId?: string | null,
  location: string
}>()

onMounted(async () => {
  await getAssets()
})

const nft = reactive<NFT>({
  name: '',
  symbol: '',
  icon: '',
  balance: 0,
  address: props.address,
  tokenId: props.tokenId,
  isNFT: true
})
const showDialog = ref(false)
const component: Component = shallowRef(undefined)

const getAssets = async () => {
  const { provider, ethereumProvider } = await getEthers()
  const account = store.state.currentAddress
  const controller = new ERC725js([...LSP4DigitalAssetSchema, LSP8MetadataJSONSchema] as ERC725JSONSchema[], props.address, provider, {
    ipfsGateway: IPFS_GATEWAY_BASE_URL
  })

  const metadata = await controller.fetchData([
    'LSP4TokenName',
    'LSP4TokenSymbol',
    props.tokenId
      ? {
          keyName: 'LSP8MetadataJSON:<bytes32>',
          dynamicKeyParts: props.tokenId
        }
      : 'LSP4Metadata',
    'LSP4Metadata'
  ])
  nft.name = metadata[0].value as string
  nft.symbol = metadata[1].value as string
  try {
    nft.icon = handlerIPFSImg(metadata[2].value.LSP4Metadata.icon[0].url)
  } catch (error) {
    nft.icon = handlerIPFSImg(metadata[3].value.LSP4Metadata.icon[0].url)
  }
  const lsp4DigitalAssetContract = new ethers.Contract(props.address, LSP7DigitalAssetSchema.abi, ethereumProvider)
  nft.balance = await lsp4DigitalAssetContract.balanceOf(account)
}
const openDialog = () => {
  const isCreated = props.location === LOCATION.created
  component.value = isCreated ? MintNFT : SendAssets
  showDialog.value = true
}
</script>

<template>
  <div>
    <Cell size="large" inset center class="cell truncate" is-link :icon="nft.icon" @click="openDialog">
      <template #title>
        {{ nft.name }}<span v-if="nft.symbol">({{ nft.symbol }})</span>
      </template>
      <template #value>
        <span>{{ LOCATION.created === location ? `Supply : ${nft.balance}` : `` }}</span>
      </template>
    </Cell>
    <DialogComponent v-model:show="showDialog" teleport="body" width="100%" :overlay="false"
      :show-confirm-button="false" class="h-full max-w-screen-md !bg-light !rounded-none">
      <component :is="component" v-model:show="showDialog" :assets="nft" @update="emit('update')"></component>
    </DialogComponent>
  </div>
</template>

<style scoped>
.cell {
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-cell-text-color: var(--color-text-primary);
  --van-text-color: #C6C6C6;
  --van-cell-value-color: #C6C6C6;
  --van-cell-border-color: var(--color-bg-primary);
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
