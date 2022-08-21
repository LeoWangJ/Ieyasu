<script setup lang="ts">
import ProfileInfo from '@/components/ProfileInfo.vue'
import LSP5ReceivedAssets from '@/components/LSP5ReceivedAssets.vue'
import LSP12CreatedAssets from '@/components/LSP12CreatedAssets.vue'
import LSP10Vault from '@/components/LSP10Vault.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Tab, Tabs } from 'vant'
import { getEthers } from '@/composables/ethers'
import 'vant/es/toast/style'
import store from '@/store'
onMounted(async () => {
  await login()
})
const active = ref(0)
const tabs = [
  { id: 0, name: 'Received', component: LSP5ReceivedAssets },
  { id: 1, name: 'Created', component: LSP12CreatedAssets },
  { id: 2, name: 'Vaults', component: LSP10Vault }
]
const login = async () => {
  const router = useRouter()
  try {
    const { account, isEOAccount } = await getEthers()
    if (!account) {
      throw Error('No accounts')
    }
    await store.dispatch('initAddress', account)
    setupLocalStorage('legacyAssets', account)
    setupLocalStorage('vaults', account)
    if (isEOAccount) {
      setupLocalStorage('receivedAssets', account)
      setupLocalStorage('issuedAssets', account)
    } else {
      // clearLocalStorage('receivedAssets')
      // clearLocalStorage('issuedAssets')
      // clearLocalStorage('vaults')
    }
  } catch (e) {
    Toast.fail('Not Login')
    router.push('/login')
  }
}

const setupLocalStorage = (itemName:string, account:string) => {
  if (localStorage.getItem(itemName) === null) {
    localStorage.setItem(itemName, JSON.stringify({ value: [], account: account }))
  } else {
    const localStorageOwner = JSON.parse(localStorage.getItem(itemName) as string)

    if (localStorageOwner.account !== account) {
      localStorage.removeItem(itemName)
    }
  }
}

const clearLocalStorage = (itemName:string) => {
  if (localStorage.getItem(itemName) !== null) {
    localStorage.removeItem(itemName)
  }
}
</script>

<template>
  <ProfileInfo></ProfileInfo>
  <Tabs v-model:active="active" animated>
    <Tab v-for="item in tabs" :title="item.name" :key="item.id">
      <component :is="item.component"></component>
    </Tab>
  </Tabs>
</template>
>
