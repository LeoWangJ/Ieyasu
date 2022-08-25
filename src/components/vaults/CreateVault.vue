<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { getEthers } from '@/composables/ethers'
import { settingURDAddressInStorage } from '@/composables/createEOA'

const error = ref('')
const step = ref(0)
const txHash = ref('')

const emit = defineEmits(['close'])
onMounted(async () => {
  console.log(1)
  await createVault()
})

const createVault = async () => {
  const { account, signer } = await getEthers()
  try {
    const recipient = await settingURDAddressInStorage(account, signer, process.env.VUE_APP_PRIVATE_KEY as string)
    if (localStorage.getItem('vaults')) {
      const LSP9Vaults = JSON.parse(localStorage.getItem('vaults') as string)
      LSP9Vaults.value = [...LSP9Vaults.value, recipient.address]
      localStorage.setItem('vaults', JSON.stringify(LSP9Vaults))
    }
    step.value = 1
    txHash.value = recipient.hash
  } catch (err:Error) {
    console.log(err)
    error.value = err
  }
}

const clickNavBar = () => {
  emit('close', step.value)
  step.value = 0
  error.value = ''
}

</script>

<template>
  <div class="text-primary">
    <van-nav-bar title="Create Own Vault" left-arrow @click-left="clickNavBar" />
    <van-steps :active="step" active-icon="success" class="my-2">
      <van-step>Creating</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>
    <div v-if="step == 0">
      Need three times transactions , please be patient!
    </div>
    <div v-if="step == 1" class="break-words">
    🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
          txHash
      }}</a>
    </div>
    <p v-if="error" class="text-[red]">{{ error }}</p>
  </div>
</template>
