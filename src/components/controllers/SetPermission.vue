<script setup lang="ts">
import { getPermission, setKMPermission, setVaultPermission } from '@/composables/createEOA'
import { getEthers } from '@/composables/ethers'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { onMounted, ref, useAttrs } from 'vue'
import { useStore } from 'vuex'
const store = useStore()

const attr = useAttrs()

const emit = defineEmits(['close'])
const error = ref('')
const step = ref(0)
const txHash = ref('')
const showCreateVault = ref(false)

const settingPermission = async () => {
  const { account, signer } = await getEthers()
  const privateKey = process.env.VUE_APP_PRIVATE_KEY as string
  const thirdPartyAddress = '0x5481a9AAC94975B22A269229Fd717651647E303f'
  const permissions = {
    TRANSFERVALUE: true,
    SETDATA: true,
    DEPLOY: false,
    CALL: true
  }
  const result = await setKMPermission({
    account,
    signer,
    privateKey,
    thirdPartyAddress,
    permissions
  })
  txHash.value = result.hash
}
const settingVaultPermission = async () => {
  const { account, signer } = await getEthers()
  const privateKey = process.env.VUE_APP_PRIVATE_KEY as string
  const thirdPartyAddress = '0x5481a9AAC94975B22A269229Fd717651647E303f'
  const result = await setVaultPermission(account, attr.address as string, signer, privateKey, thirdPartyAddress)
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
      <van-nav-bar title="Setting Permission" left-arrow @click-left="clickNavBar" />
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
