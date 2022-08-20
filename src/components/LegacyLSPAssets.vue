<script setup lang="ts">import { ethers } from 'ethers'
import { Toast } from 'vant'
import { ref } from 'vue'

const emit = defineEmits(['close'])
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
  console.log('LSP5LegacyAssets.value.indexOf(legacyAddress):', LSP5LegacyAssets.value.indexOf(legacyAddress))
  if (LSP5LegacyAssets.value.indexOf(legacyAddress) === -1) {
    LSP5LegacyAssets.value = [...LSP5LegacyAssets.value, legacyAddress.value]
    localStorage.setItem('legacyAssets', JSON.stringify(LSP5LegacyAssets))
  }
  legacyAddress.value = ''
  disabled.value = false

  Toast.success({
    message: 'success!',
    onClose: () => {
      emit('close')
    }
  })
}
</script>

<template>
<van-nav-bar title="Find Legacy Assets" left-arrow @click-left="emit('close')"/>
<van-field v-model="legacyAddress" placeholder="0x..." label="Legacy Assets Address" />
<van-button type="primary" @click="sendLegacyAddress" :disabled="disabled">Confirm</van-button>
<p v-if="error" class="text-[red]">{{ error }}</p>
</template>
