<script setup lang="ts">
import { getEthers } from '@/composables/useEthers'
import { ethers } from 'ethers'
import { onMounted, reactive, ref } from 'vue'
import { Dialog, Toast } from 'vant'
const DialogComponent = Dialog.Component
const balance = ref<string | number>(0)
const showDialog = ref(false)
const recipientAddress = ref('')
const sendAmount = ref(0)
const error = reactive({
  recipientAddress: '',
  sendAmount: ''
})
onMounted(async () => {
  await getBanlance()
})
const transferLYX = async () => {
  const { account, signer } = await getEthers()
  const amount = ethers.utils.parseEther(`${sendAmount.value}`)
  await signer.sendTransaction({
    from: account,
    to: recipientAddress.value,
    value: amount,
    gasLimit: 300_000,
    gasPrice: '1000000000'
  })
}
const getBanlance = async () => {
  const { account, ethereumProvider } = await getEthers()
  const weiBalanceOf = await ethereumProvider.getBalance(account)
  const balanceOf = ethers.utils.formatEther(weiBalanceOf.toString())
  balance.value = (+balanceOf) === 0 ? +balanceOf : (+balanceOf).toFixed(2)
}

const open = () => {
  showDialog.value = true
  recipientAddress.value = ''
  sendAmount.value = 0
  error.recipientAddress = ''
  error.sendAmount = ''
}

const beforeClose = async (action:string) => {
  if (action === 'cancel') return true
  if (action !== 'confirm') return false
  error.recipientAddress = ''
  error.sendAmount = ''
  const isAddress = ethers.utils.isAddress(recipientAddress.value)
  if (!isAddress) {
    error.recipientAddress = 'Recipient Address is not valid'
    return false
  }
  try {
    await transferLYX()
    await getBanlance()
    Toast.success('Transaction success !')
    return true
  } catch (e:Error) {
    Toast.fail({
      type: 'html',
      message: `Transaction fail ! <br/> ${e.message}`,
      duration: 5000
    })
    return false
  }
}
</script>

<template>
  <div class="text-primary absolute z-10 top-2 right-5">
    <div class="flex items-center cursor-pointer" @click="open">
       <img src="@/assets/lukso.png" class="w-5 h-5 mr-1"/>
       <span>{{ balance }} LYX</span>
    </div>
  </div>
  <div class="base_dialog">
    <DialogComponent
      v-model:show="showDialog"
      show-cancel-button
      confirmButtonText="CONFIRM"
      cancelButtonText="CANCEL"
      :before-close="beforeClose"
    >
      <van-field v-model="recipientAddress" placeholder="0x..." label="Recipient Address" :error-message="error.recipientAddress"/>
      <van-field  v-model.number="sendAmount" label="Amount To Send" :error-message="error.sendAmount"/>
    </DialogComponent>
  </div>
</template>
<style scoped>
.base_dialog {
  --van-dialog-width:360px;
  --van-dialog-border-radius: 8px;
  --van-dialog-header-padding-top: 30px;
  @apply text-primary;
  --van-button-default-background-color: var(--color-bg-secondary);
  --van-dialog-confirm-button-text-color: var(--color-theme);
  --van-dialog-background-color: var(--color-bg-secondary);
}
:deep(.van-popup){
  --van-popup-background-color: var(--color-bg-secondary);
}
.base_dialog :deep(.van-dialog__header) {
  @apply text-left pl-5;
}

.base_dialog :deep(.van-hairline--top::after) {
  @apply border-t-0;
}

.base_dialog :deep(.van-hairline--left::after) {
  @apply border-l-0;
}

.base_dialog :deep(.van-dialog__message--has-title) {
  @apply text-primary;
}

.base_dialog :deep(.van-dialog__cancel) {
  color: #C6C6C6;
}

:deep(.van-cell){
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-field-label-color: var(--color-text-primary);
  --van-field-input-text-color: var(--color-text-primary);
  --van-cell-border-color: var(--color-bg-primary);
  --van-cell-value-color:var(--color-text-primary);
  --van-field-label-width: 120px;
}
:deep(.van-button){
  --van-button-border-width:0;
  --van-button-default-color: var(--color-theme);
}
</style>
