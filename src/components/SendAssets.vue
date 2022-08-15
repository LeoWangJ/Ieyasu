<script setup lang="ts">
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { NFT } from '@/utils/types'
import { onMounted, ref } from 'vue'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { ethers, Signer } from 'ethers'
import { Toast } from 'vant'

const props = defineProps<{
  show: boolean,
  assets: NFT
}>()

const emit = defineEmits(['update:show'])
const isL16Network = ref(true)
const disabled = ref(false)
const error = ref('')
const step = ref(0)
const recipientAddress = ref('')
const isRecipientEOA = ref(false)
const txHash = ref('')
const sendAmount = ref(0)

onMounted(async () => {
  await checkNetwork()
})

const checkNetwork = async () => {
  isL16Network.value = await isLuksoNetwork()
}

const send = async () => {
  step.value = 1
  error.value = ''
  disabled.value = true
  const { ethereumProvider, account, signer } = await getEthers()
  const isAddress = ethers.utils.isAddress(recipientAddress.value)
  if (!isAddress) {
    error.value = 'Recipient Address is not valid'
    step.value = 0
    disabled.value = false
    return
  }
  const bytecode = await ethereumProvider.getCode(recipientAddress.value)
  if (bytecode === '0x') {
    isRecipientEOA.value = true
  }
  try {
    props.assets.isNFT ? await sendLSP8Token(account, signer) : await sendLSP7Token(account, signer)

    if (localStorage.getItem('receivedAssets')) {
      const LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets'))
      LSP5ReceivedAssets.value = LSP5ReceivedAssets.value.filter(function (assetAddress: string) {
        return assetAddress !== props.assets.address
      })
      localStorage.setItem('receivedAssets', JSON.stringify(LSP5ReceivedAssets))
    }
  } catch (err: Error) {
    error.value = err.message
    disabled.value = false
    return
  }
  step.value = 2
  Toast.success('success!')
  disabled.value = false
}

const sendLSP7Token = async (fromAddress: string, signer: Signer) => {
  const controller = new ethers.Contract(props.assets.address, LSP7DigitalAsset.abi, signer)
  const amount = ethers.utils.parseEther(`${sendAmount.value}`)
  const receipt = await controller.transfer(fromAddress, recipientAddress.value, amount, isRecipientEOA.value, '0x')
  txHash.value = receipt.hash
}

const sendLSP8Token = async (fromAddress: string, signer: Signer) => {
  const controller = new ethers.Contract(props.assets.address, LSP8IdentifiableDigitalAsset.abi, signer)

  const receipt = await controller.transfer(fromAddress, recipientAddress.value, props.assets.tokenId, isRecipientEOA.value, '0x')
  txHash.value = receipt.hash
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
    isRecipientEOA.value = false
    sendAmount.value = 0
    txHash.value = ''
    recipientAddress.value = ''
    emit('update:show', false)
  }
}
</script>

<template>
  <van-nav-bar :title="`Transfer ${assets.name}(${assets.symbol})`" left-arrow @click-left="clickNavBar" />
  <van-steps :active="step" active-icon="success" active-color="#38f">
    <van-step>Input transfer Information</van-step>
    <van-step>Transition</van-step>
    <van-step>🎉 Success</van-step>
  </van-steps>
  <p v-if="!isL16Network">
    Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16
    </span>to send this token.
  </p>
  <div v-if="step == 0">
    <van-field v-model="recipientAddress" placeholder="0x..." label="Recipient Address" />
    <van-field v-if="!assets.isNFT" v-model.number="sendAmount" label="Amount To Send" />
    <van-button type="primary" @click="send" :disabled="disabled">Transfer</van-button>
  </div>
  <div v-if="step == 1">
    Transition... , please be patient!
  </div>
  <div v-if="step == 2">
    🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
        txHash
    }}</a>
  </div>
  <p v-if="error" class="text-[red]">{{ error }}</p>
</template>
