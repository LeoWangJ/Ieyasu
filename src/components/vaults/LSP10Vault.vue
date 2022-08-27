<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP10ReceivedVaultsSchema from '@erc725/erc725.js/schemas/LSP10ReceivedVaults.json'
import { getEthers } from '@/composables/ethers'
import { Dialog, Toast, NoticeBar } from 'vant'
import { useClipboard } from '@vueuse/core'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { useStore } from 'vuex'
import CreateVault from './CreateVault.vue'
import LoadingAnimate from '../LoadingAnimate.vue'
const store = useStore()

const disabled = ref(false)
const vaults = ref<string[]>([])
const address = ref('')
const isL16Network = ref(true)
const showDialog = ref(false)
const loading = ref(true)
const DialogComponent = Dialog.Component

const { copy, copied } = useClipboard({ source: address })
const cantCreateVault = computed(() => store.state.currentAddress !== store.state.account)
onMounted(async () => {
  await getVaults()
  await checkNetwork()
})

const checkNetwork = async () => {
  isL16Network.value = await isLuksoNetwork()
}

const getVaults = async () => {
  loading.value = true
  const { provider, account } = await getEthers()
  const controller = new ERC725(LSP10ReceivedVaultsSchema as ERC725JSONSchema[], account, provider)
  try {
    const LSP10Vaults = await controller.fetchData([
      'LSP10Vaults[]'
    ])
    vaults.value = LSP10Vaults[0].value.length ? [account, ...LSP10Vaults[0].value] : [account]
  } catch (e) {
    console.log(e)
    const LSP10Vaults = JSON.parse(localStorage.getItem('vaults') as string)
    vaults.value = LSP10Vaults.value ? [account, ...LSP10Vaults.value] : [account]
  }
  loading.value = false
}

const copyHandler = (vaultAddress:string) => {
  address.value = vaultAddress
  copy(vaultAddress)
  if (copied) return Toast.success('copied!')
}

const select = (address:string) => {
  Toast.success('switch done!')
  store.commit('switchAddress', address)
}

const open = () => {
  showDialog.value = true
  disabled.value = true
}

const close = async (step:number) => {
  disabled.value = false
  showDialog.value = false
  if (step === 2) {
    await getVaults()
  }
}

</script>

<template>
  <div class="flex m-3">
    <van-button @click="open" :disabled="disabled || cantCreateVault">CREATE VAULT</van-button>
  </div>
  <LoadingAnimate v-if="loading"></LoadingAnimate>
  <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o" v-if="!isL16Network">
    <p>
      Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16
      </span>to send this token.
    </p>
  </NoticeBar>
  <div v-if="vaults.length && !loading">
    <p class="m-2 text-primary">OWNER & VAULTs</p>
    <van-radio-group v-model="store.state.currentAddress" checked-color="var(--color-theme)">
      <van-cell-group>
        <van-cell v-for="(vault,index) in vaults" :key="vault" size="large" center class="cell truncate" >
          <template #title>
            <div class="text-shadow-lg">
            {{ `${vault.slice(0,8)}...${vault.slice(-6)}` }} <van-tag class="mr-1" v-if="index === 0">vaults owner</van-tag>
            <van-icon name="link-o" @click="copyHandler(vault)" class="cursor-pointer"/>
            </div>
          </template>
          <template #right-icon>
            <van-radio :name="vault"  @click="select(vault)"/>
          </template>
        </van-cell>
      </van-cell-group>
    </van-radio-group>
  </div>

  <DialogComponent v-model:show="showDialog" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-light !rounded-none">
    <CreateVault  @close="close" v-if="showDialog" :vaultLength="vaults.length -1"></CreateVault>
  </DialogComponent>
</template>
<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color: var(--color-theme);
  --van-button-default-border-color: var(--color-theme);
}
:deep(.van-hairline--top-bottom:after, .van-hairline-unset--top-bottom:after){
  border-width: 0;
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

:deep(.van-cell__left-icon) {
  font-size: 30px;
}

:deep(.van-cell-group){
  --van-cell-group-background-color:var(--color-bg-secondary);
}
</style>
