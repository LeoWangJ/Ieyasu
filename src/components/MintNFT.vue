<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import LSP8Mintable from '@lukso/lsp-smart-contracts/artifacts/LSP8Mintable.json'
import { getEthers } from '@/composables/ethers'
import { NFT } from '@/utils/types'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { ethers } from 'ethers'
import { Toast } from 'vant'

const props = defineProps<{
  show: boolean,
  assets: NFT
}>()

const isL16Network = ref(true)
const disabled = ref(false)
const error = ref('')
const step = ref(0)
const isMinterEOA = ref(false)
const mintInfo = reactive({
  tokenId: '',
  icon: null,
  description: ''
})
const txHash = ref('')
const emit = defineEmits(['update:show'])

onMounted(async () => {
  await checkNetwork()
})

const checkNetwork = async () => {
  isL16Network.value = await isLuksoNetwork()
}

const mint = async () => {
  step.value = 1
  disabled.value = true
  error.value = ''
  if (mintInfo.tokenId === '') {
    error.value = "tokenID can't empty"
    step.value = 0
    disabled.value = false
    return
  }

  const { account, isEOAccount, signer } = await getEthers()
  if (isEOAccount) {
    isMinterEOA.value = true
  }
  const paddedTokenId = ethers.utils.formatBytes32String(`${mintInfo.tokenId}`)
  try {
    const lsp8IdentifiableDigitalAssetContract = new ethers.Contract(props.assets.address, LSP8Mintable.abi, signer)
    const receipt = await lsp8IdentifiableDigitalAssetContract.mint(account, paddedTokenId, isMinterEOA.value, '0x')
    txHash.value = receipt.hash
    if (isEOAccount) {
      const LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets') as string)

      if (LSP5ReceivedAssets.value.indexOf(props.assets.address) === -1) {
        LSP5ReceivedAssets.value.push(props.assets.address)
        localStorage.setItem('receivedAssets', JSON.stringify(LSP5ReceivedAssets))
      }
    }
  } catch (err: Error) {
    console.log(err)
    error.value = err.message
    disabled.value = false
    return
  }
  Toast.success('success!')
  step.value = 2
  disabled.value = false
}
const clickNavBar = () => {
  if (step.value === 1) {
    step.value = 0
    error.value = ''
  } else if (step.value === 2) {
    location.reload()
  } else {
    disabled.value = false
    error.value = ''
    step.value = 0
    isMinterEOA.value = false
    mintInfo.tokenId = ''
    txHash.value = ''
    emit('update:show', false)
  }
}
</script>

<template>
  <van-nav-bar :title="`Mint ${assets.name}(${assets.symbol}) Collection`" left-arrow @click-left="clickNavBar" />
  <van-steps :active="step" active-icon="success" active-color="#38f">
    <van-step>Input NFT Collection Infomation</van-step>
    <van-step>Minting</van-step>
    <van-step>🎉 Success</van-step>
  </van-steps>
  <p v-if="!isL16Network">
    Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16
    </span>to mint this collection.
  </p>
  <div v-if="step == 0">
    <van-field v-model.number="mintInfo.tokenId" placeholder="tokenId" number label="Mint tokenID" />
    <van-button type="primary" @click="mint" :disabled="disabled">MINT NFT Collection</van-button>
  </div>
  <div v-if="step == 1">
    Minting... , please be patient!
  </div>
  <div v-if="step == 2">
    🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
      txHash }}</a>
  </div>
  <p v-if="error" class="text-[red]">{{error}}</p>
</template>
