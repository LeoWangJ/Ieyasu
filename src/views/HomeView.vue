<script setup lang="ts">
import ProfileInfo from '@/components/ProfileInfo.vue'
import { ethers } from 'ethers'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Toast } from 'vant'
import 'vant/es/toast/style'
onMounted(() => {
  login()
})

const login = async () => {
  const router = useRouter()
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.listAccounts()
    if (accounts.length === 0) {
      throw Error('No accounts')
    }
    const account = accounts[0]
    console.log(account)
  } catch (e) {
    Toast.fail('Not Login')
    router.push('/login')
  }
}
</script>

<template>
  <ProfileInfo></ProfileInfo>
</template>
>
