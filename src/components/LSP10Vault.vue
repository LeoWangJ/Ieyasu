<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LSP10ReceivedVaultsSchema from '@erc725/erc725.js/schemas/LSP10ReceivedVaults.json'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import { getEthers } from '@/composables/ethers'
import { settingURDAddressInStorage } from '@/composables/createEOA'
import { Dialog, Toast } from 'vant'
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
  copy()
  if (copied) return Toast.success('copied!')
}

const clickNavBar = () => {
  if (step.value === 1) {
    disabled.value = false
    step.value = 0
    error.value = ''
    txHash.value = ''
    getVaults()
  }
  error.value = ''
  showCreateVault.value = false
}

const select = (address:string) => {
  Toast.success('switch done!')
  store.commit('switchAddress', address)
}
</script>

<template>
  <van-button type="primary" @click="createVault" :disabled="disabled">Create Own Vault</van-button>
  <p class="m-2">My Vaults</p>
  <van-radio-group v-model="store.state.currentAddress">
    <van-cell-group inset>
      <van-cell v-for="(vault,index) in vaults" :key="vault" size="large" inset center class="cell truncate" >
        <template #title>
          <div class="text-shadow-lg">
          {{ `${vault.slice(0,8)}...${vault.slice(-6)}` }} <van-tag class="mr-1" v-if="index === 0">vaults owner</van-tag>
          <van-icon name="link-o" @click="copyHandler" class="cursor-pointer"/>
          </div>
        </template>
        <template #right-icon>
          <van-radio :name="vault"  @click="select(vault)"/>
        </template>
      </van-cell>
    </van-cell-group>
  </van-radio-group>

  <DialogComponent v-model:show="showCreateVault" teleport="body" width="100%" :overlay="false" :show-confirm-button="false"
    class="h-full max-w-screen-md !bg-primary !rounded-none">
    <van-nav-bar title="Create Own Vault" left-arrow @click-left="clickNavBar" />
    <van-steps :active="step" active-icon="success" active-color="#38f">
      <van-step>Creating</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>
    <div v-if="step == 0">
      Need three times transactions , please be patient!
    </div>
    <div v-if="step == 1">
     🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
          txHash
      }}</a>
    </div>
    <p v-if="error" class="text-[red]">{{ error }}</p>
  </DialogComponent>
</template>
