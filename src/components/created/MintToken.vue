<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import { getEthers } from '@/composables/ethers'
import { NFT } from '@/utils/types'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { ethers } from 'ethers'
import { Toast, NoticeBar } from 'vant'
import { handlerIPFSImg } from '@/utils'

const props = defineProps<{
  show: boolean,
  assets: NFT
}>()

const isL16Network = ref(true)
const disabled = ref(false)
const error = ref('')
const step = ref(0)
const isMinterEOA = ref(false)
const mintAmount = ref(0)
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
  if (mintAmount.value === 0) {
    error.value = "Amount can't empty"
    step.value = 0
    disabled.value = false
    return
  }

  const { account, isEOAccount, signer } = await getEthers()
  if (isEOAccount) {
    isMinterEOA.value = true
  }
  const amount = ethers.utils.parseEther(`${mintAmount.value}`)
  try {
    const LSP7DigitalAssetContract = new ethers.Contract(props.assets.address, LSP7DigitalAsset.abi, signer)
    const receipt = await LSP7DigitalAssetContract.mint(account, amount.toString(), isMinterEOA.value, '0x')
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
  step.value = 2
  Toast.success('success!')
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
    mintAmount.value = 0
    txHash.value = ''
    emit('update:show', false)
  }
}
</script>

<template>
  <div class="text-primary">
    <van-nav-bar :title="`Mint ${assets.name}(${assets.symbol})`" left-arrow @click-left="clickNavBar" />
    <van-steps :active="step" active-icon="success" class="my-2">
      <van-step>Input Mint Amount</van-step>
      <van-step>Minting</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>
    <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o" v-if="!isL16Network">
      <p>
        Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16
        </span>to send this token.
      </p>
    </NoticeBar>

    <div v-if="step == 0" class="mt-2">
      <div class="flex  flex-col items-center mb-2">
        <p class="m-2 text-primary">{{assets.name}}({{assets.symbol}})</p>
        <van-image
          width="10rem"
          height="10rem"
          :src="handlerIPFSImg(assets.icon)"
        ></van-image>
      </div>
      <van-field v-model.number="mintAmount" placeholder="mint amount" number label="Mint Amount" />
      <div class="flex m-3 justify-center">
        <van-button  @click="mint" :disabled="disabled">MINT TOKEN</van-button>
      </div>
    </div>
    <div v-if="step == 1">
      Minting... , please be patient!
    </div>
    <div v-if="step == 2" class="break-words">
      🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
        txHash }}</a>
    </div>
    <p v-if="error" class="text-[red]">{{error}}</p>
  </div>
</template>
<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color: var(--color-theme);
  --van-button-default-border-color: var(--color-theme);
}
:deep(.van-nav-bar){
  --van-nav-bar-background-color:var(--color-bg-secondary);
  --van-nav-bar-title-text-color:var(--color-text-primary);
  --van-nav-bar-icon-color:var(--color-text-primary);
}
:deep(.van-hairline--bottom:after){
  border-width: 0;
}
:deep(.van-steps){
  --van-step-text-color:var(--color-text-primary);
  --van-step-active-color:var(--color-theme);
  --van-step-process-text-color:var(--color-text-primary);
  --van-step-line-color:var(--color-text-primary);
  --van-step-finish-line-color:var(--color-theme);
  --van-step-finish-text-color:var(--color-text-primary);
  --van-steps-background-color:var(--color-bg-secondary);
  --van-background-color-light:var(--color-bg-secondary)
}
:deep(.van-cell){
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-field-label-color: var(--color-text-primary);
  --van-field-input-text-color: var(--color-text-primary);
  --van-cell-border-color: var(--color-bg-primary);
  --van-cell-value-color:var(--color-text-primary);
}
</style>
