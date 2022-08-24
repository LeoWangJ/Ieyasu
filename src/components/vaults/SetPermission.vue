<script setup lang="ts">
import { setKMPermission, setVaultPermission } from '@/composables/createEOA'
import { getEthers } from '@/composables/ethers'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { ref } from 'vue'

const error = ref('')
const step = ref(0)
const txHash = ref('')
const showCreateVault = ref(false)

const settingPermission = async () => {
  const { account, signer } = await getEthers()
  const privateKey = process.env.VUE_APP_PRIVATE_KEY as string
  const thirdPartyAddress = '0x3456097b1012df324f37db58F2Ad08Ac62c69064'
  const permissions = {
    TRANSFERVALUE: true,
    SETDATA: true,
    DEPLOY: true
  }
  const t = await setKMPermission({
    account,
    signer,
    privateKey,
    thirdPartyAddress,
    permissions
  })
  // const t2 = await setVaultPermission(account, store.state.currentAddress, signer, privateKey, thirdPartyAddress)

  console.log(t)
}
const clickNavBar = () => {
  step.value = 0
  error.value = ''
  error.value = ''
  showCreateVault.value = false
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
