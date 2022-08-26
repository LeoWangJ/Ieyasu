<script setup lang="ts">
import { getPermission } from '@/composables/createEOA'
import { getEthers } from '@/composables/ethers'
import { onMounted, ref } from 'vue'
import { useStore } from 'vuex'
import { Button, Toast, Dialog } from 'vant'
import { useClipboard } from '@vueuse/core'
import GrantPermission from './GrantPermission.vue'
import LoadingAnimate from '../LoadingAnimate.vue'
const DialogComponent = Dialog.Component

const store = useStore()
const showDialog = ref(false)
const loading = ref(true)
const permissionList = ref<string[]>([])
const address = ref('')
const { copy, copied } = useClipboard({ source: address })

onMounted(async () => {
  await getAddressPermission()
})
const getAddressPermission = async () => {
  loading.value = true
  const { account, provider } = await getEthers()
  const result = await getPermission(account, provider)
  permissionList.value = result.value as string[]
  loading.value = false
}

const grantPermission = () => {
  showDialog.value = true
}

const close = async (step:number) => {
  showDialog.value = false
  if (step === 2) {
    await getAddressPermission()
  }
}

const copyHandler = (permissionAddress:string) => {
  address.value = permissionAddress
  copy(permissionAddress)
  if (copied) return Toast.success('copied!')
}
</script>

<template>
  <div class="flex m-3">
    <Button class="!mr-3" @click="grantPermission" :disabled="store.state.isVault">Grant Permission</Button>
  </div>
  <LoadingAnimate v-if="loading"></LoadingAnimate>
  <div v-if="permissionList.length && !loading">
    <p class="m-2 text-primary">Controllers</p>
    <van-cell v-for="(address) in permissionList" is-link :key="address" size="large" center class="cell truncate" >
      <template #title>
        <div class="text-shadow-lg">
        {{ `${address.slice(0,8)}...${address.slice(-6)}` }}
        <van-icon name="link-o" @click="copyHandler(address)" class="cursor-pointer"/>
        </div>
      </template>
    </van-cell>
  </div>
  <DialogComponent v-model:show="showDialog" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-light !rounded-none">
    <GrantPermission @close="close"></GrantPermission>
  </DialogComponent>
</template>
<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color: var(--color-theme);
  --van-button-default-border-color: var(--color-theme);
}

.cell {
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-cell-text-color: var(--color-text-primary);
  --van-text-color: #C6C6C6;
  --van-cell-value-color: #C6C6C6;
  --van-cell-border-color: var(--color-bg-primary);
}
:deep(.van-cell) {
  padding-left: 5px;
}

:deep(.van-cell__title) {
  margin-left: 10px;
}

</style>
