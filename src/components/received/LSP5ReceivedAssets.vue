<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ERC725js from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json'
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json'
import { getEthers, useAddress } from '@/composables/ethers'
import { ethers } from 'ethers'
import { INTERFACEID, LOCATION, RPC_URLS } from '@/utils/config'
import TokenAssets from '@/components/TokenAssets.vue'
import NFTAssets from '@/components/NFTAssets.vue'
import type { ReceivedTokens } from '@/utils/types'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json'
import { Dialog } from 'vant'
import LegacyLSPAssets from './LegacyLSPAssets.vue'
import { useStore } from 'vuex'
const store = useStore()

const receivedAssets = ref<string[]>([])
const receivedTokens = ref<ReceivedTokens[]>([])
const receivedNFTTokens = ref<ReceivedTokens[]>([])
const showLegacy = ref(false)
const DialogComponent = Dialog.Component
onMounted(async () => {
  if (store.state.currentAddress) {
    await getReceivedAssets()
  }
  // await transferLYX('0xCBC7c079c4042A6FD7495e7Ab1b8DD9ed39E4F9C', 50)
})
const address = computed(() => store.state.currentAddress)
watch([address], async (now, prev) => {
  if (now !== prev) {
    await getReceivedAssets()
  }
})
const getReceivedAssets = async () => {
  const { provider, ethereumProvider } = await getEthers()
  receivedAssets.value = []
  receivedTokens.value = []
  receivedNFTTokens.value = []
  const account = store.state.currentAddress
  const controller = new ERC725js(LSP5ReceivedAssetsSchema as ERC725JSONSchema[], account, provider)
  try {
    const LSP5ReceivedAssets = await controller.getData('LSP5ReceivedAssets[]')
    receivedAssets.value = LSP5ReceivedAssets.value as string[]
  } catch (e) {
    console.log(e)
    const LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets') as string)
    receivedAssets.value = LSP5ReceivedAssets.value
  }

  const LSP5LegacyAssets = JSON.parse(localStorage.getItem('legacyAssets') as string)

  if (LSP5LegacyAssets) {
    const contactArr = [...receivedAssets.value, ...LSP5LegacyAssets.value]
    receivedAssets.value = [...new Set(contactArr)]
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
}
const transferLYX = async (recipientAddress:string, sendAmount:number) => {
  const { account, signer } = await getEthers()
  // const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
  // const provider = ethers.providers.getDefaultProvider(RPC_URLS.L16)
  // const myEOA = new ethers.Wallet(privateKey, provider)
  const amount = ethers.utils.parseEther(`${sendAmount}`)
  // ssconsole.log(await myUP.isValidSignature())
  // const transferLYXPayload = await myUP.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, recipientAddress, amount.toString(), '0x'])
  // const transferLYXPayload = await myUP.execute(0, recipientAddress, amount.toString(), '0x', {
  //   gasLimit: 300_000
  // })
  await signer.sendTransaction({
    from: account,
    to: recipientAddress,
    value: amount,
    gasLimit: 300_000,
    gasPrice: '1000000000'
  })
  // console.log('transferLYXPayload:', transferLYXPayload)
  // const owner = await myUP.owner()
  // console.log('owner:', owner)
  // const myKM = new ethers.Contract(owner, KeyManager.abi, myEOA)
  // console.log('myKM:', myKM)

  // const t = await myKM.execute(transferLYXPayload, {
  //   gasLimit: 300_000
  // })
  // console.log('t:', t)
}

const closeLegacy = async () => {
  showLegacy.value = false
  await getReceivedAssets()
}

</script>

<template>
  <div class="flex m-3">
    <van-button @click="showLegacy = true">FIND LEGACY ASSETS</van-button>
  </div>
  <!-- <p class="m-2">TOKENs</p>
  <TokenAssets
    :location="LOCATION.received"
    :address="item.address"
    v-for="(item,index) in receivedTokens"
    :key="index">
  </TokenAssets> -->
  <div v-if="receivedTokens.length">
    <p class="m-2 text-primary">TOKENs</p>
    <TokenAssets
      :location="LOCATION.received"
      :address="item.address"
      v-for="(item,index) in receivedTokens"
      :key="index">
    </TokenAssets>
  </div>
  <div v-if="receivedNFTTokens.length">
    <p class="m-2 text-primary">NFTs</p>
    <NFTAssets
      :location="LOCATION.received"
      :address="item.address"
      :tokenId="item.tokenId"
      v-for="(item,index) in receivedNFTTokens"
      :key="index">
    </NFTAssets>
  </div>
  <DialogComponent v-model:show="showLegacy" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-light !rounded-none">
    <LegacyLSPAssets @close="closeLegacy"></LegacyLSPAssets>
  </DialogComponent>
</template>
<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color: var(--color-theme);
  --van-button-default-border-color: var(--color-theme);
}
</style>
