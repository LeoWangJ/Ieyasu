<script setup lang="ts">
import { setVaultPermission } from '@/composables/createEOA'
import { getEthers } from '@/composables/ethers'
import { ref } from 'vue'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { NoticeBar } from 'vant'

const props = defineProps<{
  address: string
}>()
const emit = defineEmits(['close'])

const error = ref('')
const step = ref(0)
const txHash = ref('')
const disabled = ref(false)
const privateKey = ref('')
const vaultAddress = ref('')

const settingVaultPermission = async () => {
  const { account, signer } = await getEthers()
  const result = await setVaultPermission(account, vaultAddress.value, signer, privateKey.value, props.address)
  txHash.value = result.hash
}

const clickNavBar = () => {
  emit('close', step.value)
  step.value = 0
  error.value = ''
}
</script>

<template>
   <div class="text-primary">
    <van-nav-bar title="Restrict Addresses to Vaults" left-arrow @click-left="clickNavBar" />
      <van-steps :active="step" active-icon="success" class="my-2">
      <van-step>Input Infomation</van-step>
      <van-step>Restricting</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>

    <div v-if="step == 0" class="mt-2">
      <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o" class="my-3">
        <p> This <a class="text-theme" href="https://docs.lukso.tech/guides/vault/restrict-addresses-to-vaults" target="_blaank">way</a> , when granting a third party permissions to execute through your profile, this third party will only be able to interact with the Vault, and all the other assets will be safe. </p>
      </NoticeBar>
      <van-field v-model="vaultAddress" placeholder="0x..." label="Vault Address" />
      <van-field v-model="privateKey" placeholder="Only used to execute the contract" label="Private Key" />

      <div class="flex m-3 justify-center">
        <van-button  @click="settingVaultPermission" :disabled="disabled">Restrict Addresses To Vault</van-button>
      </div>
    </div>
    <div v-if="step == 1">
      executing transactions , please be patient!
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
