<script setup lang="ts">
import ProfileInfo from '@/components/ProfileInfo.vue'
import LSP5ReceivedAssets from './received/LSP5ReceivedAssets.vue'
import LSP12CreatedAssets from './created/LSP12CreatedAssets.vue'
import LSP10Vault from './vaults/LSP10Vault.vue'
import ControllerList from './controllers/ControllerList.vue'
import { onMounted, shallowRef, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Tab, Tabs } from 'vant'
import { getEthers } from '@/composables/useEthers'
import 'vant/es/toast/style'
import store from '@/store'
onMounted(async () => {
  await login()
})
const active = ref(0)
const tabs = shallowRef([
  { id: 0, name: 'Received', component: LSP5ReceivedAssets },
  { id: 1, name: 'Created', component: LSP12CreatedAssets }
])
const login = async () => {
  const router = useRouter()
  try {
    const { account, isEOAccount } = await getEthers()
    if (!account) {
      throw Error('No accounts')
    }
    await store.dispatch('initAddress', account)
    setupLocalStorage('legacyAssets', account)
    if (isEOAccount) {
      setupLocalStorage('vaults', account)
      setupLocalStorage('receivedAssets', account)
      setupLocalStorage('issuedAssets', account)
    } else {
      tabs.value = [...tabs.value, { id: 2, name: 'Vaults', component: LSP10Vault }, { id: 3, name: 'Controllers', component: ControllerList }]

      // clearLocalStorage('receivedAssets')
      // clearLocalStorage('issuedAssets')
      clearLocalStorage('vaults')
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
  <div class="relative min-h-screen">
    <div class="relative z-1 pb-3">
      <ProfileInfo ></ProfileInfo>
      <Tabs v-model:active="active" animated clsss="tabs" lazy-render swipeable>
        <Tab v-for="item in tabs" :title="item.name" :key="item.id">
          <component :is="item.component" :key="item.id"></component>
        </Tab>

      </Tabs>
    </div>
    <div class="absolute top-7/10 left-1/2 transform -translate-x-1/2">
      <img src="@/assets/logo.png" />
    </div>
  </div>
</template>
<style scoped>
:deep(.van-tab) {
  height: 48px;
  padding: 0 12px;
  --van-tab-text-color: var(--color-text-primary);
  --van-tab-active-text-color: var(--color-theme);
  --van-tab-font-size: '14px';
}
:deep(.van-tabs__nav--line){
  padding-bottom: 0;
}
:deep(.van-tab--active)::after{
  content: "";
  position: absolute;
  bottom: 2px;
  width: 100%;
  height: 2px;
  background: var(--color-theme);
}
:deep(.van-tabs__wrap){
  --van-tabs-line-height: '48px';
  --van-tabs-nav-background-color:var(--color-bg-secondary);
  --van-tabs-bottom-bar-width: '0px';
  --van-tabs-bottom-bar-height: '2px';
  --van-tabs-bottom-bar-color: var(--color-theme);
}
</style>
