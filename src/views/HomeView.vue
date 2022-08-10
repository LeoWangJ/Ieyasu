<script setup lang="ts">
import ProfileInfo from '@/components/ProfileInfo.vue'
import LSP5ReceivedAssets from '@/components/LSP5ReceivedAssets.vue'
import LSP12CreatedAssets from '@/components/LSP12CreatedAssets.vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Toast, Tab, Tabs } from 'vant'
import { getEthers } from '@/composables/ethers'
import 'vant/es/toast/style'
onMounted(() => {
  login()
})
const active = ref(0)
const tabs = [
  { id: 0, name: 'Received', component: LSP5ReceivedAssets },
  { id: 1, name: 'Created', component: LSP12CreatedAssets }
]
const login = async () => {
  const router = useRouter()
  try {
    const { account } = await getEthers()
    if (!account) {
      throw Error('No accounts')
    }
    console.log(account)
  } catch (e) {
    Toast.fail('Not Login')
    router.push('/login')
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
