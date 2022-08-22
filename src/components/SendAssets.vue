<script setup lang="ts">
import LSP7DigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP7DigitalAsset.json'
import LSP8IdentifiableDigitalAsset from '@lukso/lsp-smart-contracts/artifacts/LSP8IdentifiableDigitalAsset.json'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { NFT } from '@/utils/types'
import { onMounted, ref } from 'vue'
import { BLOCKCHAIN_EXPLORER_BASE_URL, RPC_URLS } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { ethers, Signer } from 'ethers'
import { Toast, NoticeBar } from 'vant'
import { handlerIPFSImg } from '@/utils'
import UniversalProfile from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json'
import LSP6KeyManager from '@lukso/lsp-smart-contracts/artifacts/LSP6KeyManager.json'
import LSP9Vault from '@lukso/lsp-smart-contracts/artifacts/LSP9Vault.json'

import { useStore } from 'vuex'
import { executeByKM } from '@/composables/createEOA'
const store = useStore()

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
  const { ethereumProvider, signer } = await getEthers()
  const account = store.state.currentAddress
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
    if (props.assets.isNFT) {
      await sendLSP8Token(account, signer)
      if (localStorage.getItem('receivedAssets')) {
        const LSP5ReceivedAssets = JSON.parse(localStorage.getItem('receivedAssets') as string)
        LSP5ReceivedAssets.value = LSP5ReceivedAssets.value.filter(function (assetAddress: string) {
          return assetAddress !== props.assets.address
        })
        localStorage.setItem('receivedAssets', JSON.stringify(LSP5ReceivedAssets))
      }
    } else {
      await sendLSP7Token(account, signer)
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

const sendLSP7Token = async (fromAddress: string, signer: Signer) => {
  const controller = new ethers.Contract(props.assets.address, LSP7DigitalAsset.abi, signer)
  const amount = ethers.utils.parseEther(`${sendAmount.value}`)
  const { account } = await getEthers()

  if (store.state.isVault) {
    const targetPayload = await controller.interface.encodeFunctionData('transfer(address,address,uint256,bool,bytes)', [fromAddress, recipientAddress.value, amount.toString(), isRecipientEOA.value, '0x'])
    const myVault = new ethers.Contract(fromAddress, LSP9Vault.abi)
    const executePayloadVault = await myVault.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, controller.address, 0, targetPayload])
    const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
    const executePayload = await myUP.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, fromAddress, 0, executePayloadVault])

    const receipt = await executeByKM({
      account,
      signer,
      executePayload,
      privateKey: process.env.VUE_APP_PRIVATE_KEY as string
    })
    txHash.value = receipt.hash
  } else {
    const receipt = await controller.transfer(fromAddress, recipientAddress.value, amount, isRecipientEOA.value, '0x', {
      gasLimit: 300_0000
    })
    txHash.value = receipt.hash
  }
}

const sendLSP8Token = async (fromAddress: string, signer: Signer) => {
  const controller = new ethers.Contract(props.assets.address, LSP8IdentifiableDigitalAsset.abi, signer)
  const { account } = await getEthers()
  if (store.state.isVault) {
    const targetPayload = await controller.interface.encodeFunctionData('transfer(address,address,bytes32,bool,bytes)', [fromAddress, recipientAddress.value, props.assets.tokenId, isRecipientEOA.value, '0x'])
    const myVault = new ethers.Contract(fromAddress, LSP9Vault.abi)
    const executePayloadVault = await myVault.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, controller.address, 0, targetPayload])
    const myUP = new ethers.Contract(account, UniversalProfile.abi, signer)
    const executePayload = await myUP.interface.encodeFunctionData('execute(uint256,address,uint256,bytes)', [0, fromAddress, 0, executePayloadVault])

    const receipt = await executeByKM({
      account,
      signer,
      executePayload,
      privateKey: process.env.VUE_APP_PRIVATE_KEY as string
    })
    txHash.value = receipt.hash
  } else {
    const receipt = await controller.transfer(fromAddress, recipientAddress.value, props.assets.tokenId, isRecipientEOA.value, '0x', {
      gasLimit: 300_0000
    })
    txHash.value = receipt.hash
  }
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
  <div class="text-primary">
    <van-nav-bar :title="`Transfer ${assets.name}(${assets.symbol})`" left-arrow @click-left="clickNavBar" />
    <van-steps :active="step" active-icon="success" class="my-2">
      <van-step>Input Information</van-step>
      <van-step>Transition</van-step>
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
      <van-field v-model="recipientAddress" placeholder="0x..." label="Recipient Address" />
      <van-field v-if="!assets.isNFT" v-model.number="sendAmount" label="Amount To Send" />
      <div class="flex m-3 justify-center">
        <van-button @click="send" :disabled="disabled">TRANSFER</van-button>
      </div>
    </div>
    <div v-if="step == 1">
      Transition... , please be patient!
    </div>
    <div v-if="step == 2" class="break-words">
      🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
          txHash
      }}</a>
    </div>
    <p v-if="error" class="text-[red]">{{ error }}</p>
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
