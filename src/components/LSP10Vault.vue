<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LSP10ReceivedVaultsSchema from '@erc725/erc725.js/schemas/LSP10ReceivedVaults.json'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import { getEthers } from '@/composables/ethers'
import { settingURDAddressInStorage } from '@/composables/createEOA'
import { Dialog, Toast, NoticeBar } from 'vant'
import { useClipboard } from '@vueuse/core'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { useStore } from 'vuex'
const store = useStore()

const disabled = ref(false)
const error = ref('')
const step = ref(0)
const txHash = ref('')
const vaults = ref<string[]>([])
const address = ref('')
const isL16Network = ref(true)
const showCreateVault = ref(false)
const DialogComponent = Dialog.Component

const { copy, copied } = useClipboard({ source: address })

onMounted(async () => {
  await getVaults()
})
const checkNetwork = async () => {
  isL16Network.value = await isLuksoNetwork()
}

const getVaults = async () => {
  const { account } = await getEthers()

  const LSP10Vaults = JSON.parse(localStorage.getItem('vaults') as string)
  console.log('LSP10Vaults:', JSON.parse(localStorage.getItem('vaults') as string))

  vaults.value = [account, ...LSP10Vaults.value]
  // TODO: LSP10Vaults always empty..
  // const { provider, account } = await getEthers()
  // const controller = new ERC725(LSP10ReceivedVaultsSchema as ERC725JSONSchema[], account, provider)
  // try {
  //   const LSP10Vaults = await controller.fetchData([
  //     'LSP10Vaults[]'
  //   ])
  //   vaults.value = LSP10Vaults[0].value
  // } catch (e) {
  //   const LSP10Vaults = JSON.parse(localStorage.getItem('vaults') as string)
  //   vaults.value = LSP10Vaults.value
  // }
  console.log('LSP10Vaults:', vaults.value)
}

const createVault = async () => {
  await checkNetwork()
  if (!isL16Network.value) return
  disabled.value = true
  showCreateVault.value = true
  const { account, signer } = await getEthers()
  try {
    const recipient = await settingURDAddressInStorage(account, signer)
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
  disabled.value = false
}
const copyHandler = (vaultAddress:string) => {
  address.value = vaultAddress
  copy(vaultAddress)
  if (copied) return Toast.success('copied!')
}

const clickNavBar = () => {
  disabled.value = false
  step.value = 0
  error.value = ''
  error.value = ''
  showCreateVault.value = false
  if (step.value === 1) {
    getVaults()
  }
}

const select = (address:string) => {
  Toast.success('switch done!')
  store.commit('switchAddress', address)
}
</script>

<template>
  <div class="flex m-3">
    <van-button @click="createVault" :disabled="disabled">CREATE VAULT</van-button>
  </div>

  <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o" v-if="!isL16Network">
    <p>
      Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16
      </span>to send this token.
    </p>
  </NoticeBar>
  <p class="m-2 text-primary">VAULTs</p>
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

  <DialogComponent v-model:show="showCreateVault" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-light !rounded-none">
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

:deep(.van-nav-bar){
  --van-nav-bar-background-color:var(--color-bg-secondary);
  --van-nav-bar-title-text-color:var(--color-text-primary);
  --van-nav-bar-icon-color:var(--color-text-primary);
}
:deep(.van-hairline--bottom:after){
  border-width: 0;
}
:deep(.van-steps){
  --van-step-text-color:var(--color-text-primary);
  --van-step-active-color:var(--color-theme);
  --van-step-process-text-color:var(--color-text-primary);
  --van-step-line-color:var(--color-text-primary);
  --van-step-finish-line-color:var(--color-theme);
  --van-step-finish-text-color:var(--color-text-primary);
  --van-steps-background-color:var(--color-bg-secondary);
  --van-background-color-light:var(--color-bg-secondary)
}
</style>
