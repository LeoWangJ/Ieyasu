<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json'
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7Mintable.json'
import { getEthers } from '@/composables/ethers'
import { handlerIPFSImg } from '@/utils'
import { NFT } from '@/utils/types'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { ethers } from 'ethers'

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
      const LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets'))

      if (LSP5ReceivedAssets.value.indexOf(props.assets.address) === -1) {
        LSP5ReceivedAssets.value.push(props.assets.address)
        localStorage.setItem('receivedAssets', JSON.stringify(LSP5ReceivedAssets))
      }
    }
  } catch (err:any) {
    console.log(err)
    error.value = err.message
    disabled.value = false
    return
  }
  step.value = 2
  disabled.value = false
}
const clickNavBar = () => {
  if (step.value === 1) {
    step.value = 0
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
  <van-nav-bar :title="`Mint ${assets.name}(${assets.symbol})`" left-arrow @click-left="clickNavBar"/>
  <van-steps :active="step" active-icon="success" active-color="#38f">
    <van-step>Input Mint Amount</van-step>
    <van-step>Minting</van-step>
    <van-step>🎉 Success</van-step>
  </van-steps>
  <p v-if="!isL16Network">
    Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16 </span>to create this token.
  </p>
  <div v-if="step == 0">
    <van-field v-model.number="mintAmount" placeholder="mint amount" number label="Mint Amount"/>
    <van-button type="primary" @click="mint" :disabled="disabled">MINT TOKEN</van-button>
  </div>
  <div v-if="step == 1">
    Minting... , please be patient!
  </div>
  <div v-if="step == 2">
     🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{ txHash }}</a>
  </div>
  <p v-if="error" class="text-[red]">{{error}}</p>
</template>
