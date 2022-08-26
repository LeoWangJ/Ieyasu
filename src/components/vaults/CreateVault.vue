<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { settingURDAddressInStorage } from '@/composables/createEOA'

const error = ref('')
const step = ref(0)
const txHash = ref('')
const disabled = ref(false)
const privateKey = ref('')
const emit = defineEmits(['close'])

const createVault = async () => {
  disabled.value = true
  const { account, signer } = await getEthers()
  step.value = 1
  try {
    const recipient = await settingURDAddressInStorage(account, signer, privateKey.value)
    if (localStorage.getItem('vaults')) {
      const LSP9Vaults = JSON.parse(localStorage.getItem('vaults') as string)
      LSP9Vaults.value = [...LSP9Vaults.value, recipient.address]
      localStorage.setItem('vaults', JSON.stringify(LSP9Vaults))
    }
    step.value = 2
    txHash.value = recipient.hash
  } catch (err:Error) {
    console.log(err)
    error.value = err
    step.value = 0
  }
  disabled.value = false
}

const clickNavBar = () => {
  emit('close', step.value)
  step.value = 0
  error.value = ''
  disabled.value = false
}

</script>

<template>
  <div class="text-primary">
    <van-nav-bar title="Create Own Vault" left-arrow @click-left="clickNavBar" />
    <van-steps :active="step" active-icon="success" class="my-2">
      <van-step>Input Infomation</van-step>
      <van-step>Creating</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>
    <div v-if="step == 0" class="mt-2">
      <van-field v-model="privateKey" placeholder="Only used to execute the contract" label="Private Key" />
      <div class="flex m-3 justify-center">
        <van-button  @click="createVault" :disabled="disabled">CREATE VAULT</van-button>
      </div>
    </div>
    <div v-if="step == 1">
      Need Two times transactions , please be patient!
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
:deep(.van-cell){
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-field-label-color: var(--color-text-primary);
  --van-field-input-text-color: var(--color-text-primary);
  --van-cell-border-color: var(--color-bg-primary);
  --van-cell-value-color:var(--color-text-primary);
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

:deep(.van-nav-bar){
  --van-nav-bar-background-color:var(--color-bg-secondary);
  --van-nav-bar-title-text-color:var(--color-text-primary);
  --van-nav-bar-icon-color:var(--color-text-primary);
}
:deep(.van-hairline--bottom:after){
  border-width: 0;
}
</style>
