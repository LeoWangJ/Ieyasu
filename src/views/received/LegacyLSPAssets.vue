<script setup lang="ts">import { ethers } from 'ethers'
import { Toast } from 'vant'
import { ref } from 'vue'

const emit = defineEmits(['close', 'update'])
const legacyAddress = ref('')
const error = ref('')
const disabled = ref(false)

const sendLegacyAddress = () => {
  disabled.value = true
  const isAddress = ethers.utils.isAddress(legacyAddress.value)
  if (!isAddress) {
    error.value = 'Recipient Address is not valid'
    disabled.value = false
    return
  }
  const LSP5LegacyAssets = JSON.parse(localStorage.getItem('legacyAssets') as string)
  if (LSP5LegacyAssets.value.indexOf(legacyAddress) === -1) {
    LSP5LegacyAssets.value = [...LSP5LegacyAssets.value, legacyAddress.value]
    localStorage.setItem('legacyAssets', JSON.stringify(LSP5LegacyAssets))
  }
  legacyAddress.value = ''
  disabled.value = false

  Toast.success({
    message: 'success!',
    duration: 1000,
    onClose: () => {
      emit('update')
      emit('close')
    }
  })
}
</script>

<template>
<div>
  <van-nav-bar class="mb-2" title="Find Legacy Assets" left-arrow @click-left="emit('close')"/>
  <van-field v-model="legacyAddress" placeholder="0x..." label="Assets Address" />
  <div class="flex m-3 justify-center">
    <van-button  @click="sendLegacyAddress" :disabled="disabled">CONFIRM</van-button>
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
:deep(.van-cell){
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-field-label-color: var(--color-text-primary);
  --van-field-input-text-color: var(--color-text-primary);
  --van-cell-border-color: var(--color-bg-primary);
  --van-cell-value-color:var(--color-text-primary);
}
</style>
