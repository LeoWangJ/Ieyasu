<script setup lang="ts">
import { getEthers } from '@/composables/ethers'
import { COMMON_ABIS, INTERFACEID, IPFS_GATEWAY_BASE_URL, LOCATION } from '@/utils/config'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json'
import { ethers } from 'ethers'
import { computed, onMounted, ref, watch } from 'vue'
import TokenAssets from '@/components/TokenAssets.vue'
import NFTAssets from '@/components/NFTAssets.vue'
import { Button, NoticeBar, Dialog } from 'vant'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import LoadingAnimate from '@/components/LoadingAnimate.vue'
import CreateToken from './CreateToken.vue'
import CreateNFTToken from './CreateNFTToken.vue'
const store = useStore()
const DialogComponent = Dialog.Component

const router = useRouter()
const receivedAssets = ref<string[]>([])
const receivedTokens = ref<string[]>([])
const receivedNFTTokens = ref<string[]>([])
const loading = ref(true)
const showDialog = ref(false)
const showComponent = ref('')

const address = computed(() => store.state.currentAddress)
watch([address], async (now, prev) => {
  if (now !== prev) {
    await getCreateAssets()
  }
})

onMounted(async () => {
  if (store.state.currentAddress) {
    await getCreateAssets()
  }
})
const getCreateAssets = async () => {
  loading.value = true
  receivedAssets.value = []
  receivedTokens.value = []
  receivedNFTTokens.value = []
  const { provider, ethereumProvider } = await getEthers()
  const account = store.state.currentAddress
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
  loading.value = false
}

const open = (type?:string) => {
  showDialog.value = true
  showComponent.value = type === 'CREATE_TOKEN' ? 'CREATE_TOKEN' : 'CREATE_NFT'
}

const close = async (step:number) => {
  showDialog.value = false
  if (step === 3) {
    await getCreateAssets()
  }
}
</script>

<template>
  <div class="flex m-3">
    <Button class="!mr-3" @click="open('CREATE_TOKEN')" :disabled="store.state.isVault">CREATE TOKEN</Button>
    <Button @click="open('CREATE_NFT')" :disabled="store.state.isVault">CREATE NFT</Button>
  </div>
  <div v-if="store.state.isVault" class="m-2 text-[red]">
    <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o">
      <p>Currently only provided only owner addres for create and mint token </p>
    </NoticeBar>
  </div>
  <LoadingAnimate v-if="loading"></LoadingAnimate>
  <template v-else>
    <div v-if="receivedTokens.length">
      <p class="m-2 text-primary">TOKENs</p>
      <TokenAssets
        :location="LOCATION.created"
        @update="getCreateAssets"
        v-for="(address,index) in receivedTokens"
        :address="address"
        :key="index">
      </TokenAssets>
    </div>
    <div v-if="receivedNFTTokens.length">
      <p class="m-2 text-primary">NFTs</p>
      <NFTAssets
        :location="LOCATION.created"
        @update="getCreateAssets"
        v-for="(address,index) in receivedNFTTokens"
        :address="address"
        :key="index">
      </NFTAssets>
    </div>
  </template>
  <DialogComponent v-model:show="showDialog" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-light !rounded-none">
    <div v-if="showDialog">
      <CreateToken v-if="showComponent === 'CREATE_TOKEN'" @close="close"></CreateToken>
      <CreateNFTToken v-else  @close="close"></CreateNFTToken>
    </div>
  </DialogComponent>
</template>
<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color: var(--color-theme);
  --van-button-default-border-color: var(--color-theme);
}
</style>
