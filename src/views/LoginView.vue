<script setup lang="ts">
import { ethers } from 'ethers'
import { Button, NoticeBar } from 'vant'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
const isUnSupportBrowser = ref(true)
const requiresLogin = ref(false)
const requiresBrowserExtension = ref(false)
const useOnlyOneExtension = ref(true)
const error = ref('')
const router = useRouter()
onMounted(async () => {
  if (navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Chrome') !== -1) {
    isUnSupportBrowser.value = false
  }
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const accounts = await provider.listAccounts()
    console.log('accounts:', accounts)

    // If no account was found
    if (!accounts.length) {
      requiresLogin.value = true

      // OTHERWISE user is logged in, go to the dashboard
    } else {
      router.push('/')
    }

    // No ethereum extension connected
    // We ask the user to install the browser extension
  } else {
    requiresBrowserExtension.value = true
    useOnlyOneExtension.value = false
  }
})

const login = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const accounts = await provider.send('eth_requestAccounts', [])
  if (accounts.length) router.push('/')
  else error.value = 'No account was selected!'
}
</script>

<template>
  <NoticeBar color="#fff" background="#363636" wrapable left-icon="info-o" class="my-5" v-if="useOnlyOneExtension">
    <p>
      If you have MetaMask and Universal Profile Browser Extension installed, please disable MetaMask! See these guides for
      <a class="text-theme" href="https://support.google.com/chrome_webstore/answer/2664769?hl=en" target="_blank">Chrome</a>
      and
      <a class="text-theme" href="https://support.mozilla.org/en-US/kb/disable-or-remove-add-ons#w_disabling-and-removing-extensions" target="_blank">Firefox</a>.
    </p>
  </NoticeBar>
  <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o" v-if="isUnSupportBrowser">
    <p>
      The dApp only provides running in
      <a class="text-theme" href="https://www.google.com/chrome/" target="_blank">Chrome </a>
      or <a class="text-theme" href="https://www.mozilla.org/firefox/new/" target="_blank">Firefox</a>, Please switch one.
    </p>
  </NoticeBar>
  <template v-else>
    <NoticeBar color="#fff" background="#363636" wrapable left-icon="info-o" v-if="requiresBrowserExtension">
    <p>
        Please install the
        <a class="text-theme" href="https://docs.lukso.tech/guides/browser-extension/install-browser-extension/" target="_blank">Universal Profile Browser Extension</a>
        to use this dApp.
      </p>
    </NoticeBar>
  </template>
  <div v-if="requiresLogin" class="flex justify-center mt-5">
    <Button @click="login">Log in to browser Extension</Button>
  </div>
</template>
<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color:var(--color-theme);
  --van-button-default-border-color:var(--color-theme);
}
</style>
