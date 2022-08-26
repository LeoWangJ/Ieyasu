<script setup lang="ts">
import { getPermission, setKMPermission, setVaultPermission } from '@/composables/createEOA'
import { getEthers } from '@/composables/ethers'
import { BLOCKCHAIN_EXPLORER_BASE_URL } from '@/utils/config'
import { onMounted, reactive, ref, useAttrs } from 'vue'
import { useStore } from 'vuex'
import { NoticeBar } from 'vant'
const store = useStore()

const attr = useAttrs()

const emit = defineEmits(['close'])
const error = ref('')
const step = ref(0)
const txHash = ref('')
const disabled = ref(false)
const privateKey = ref('')
const thirdPartyAddress = ref('')
const initPermissions = {
  CHANGEOWNER: false,
  CHANGEPERMISSIONS: false,
  ADDPERMISSIONS: false,
  SETDATA: false,
  CALL: false,
  STATICCALL: false,
  DELEGATECALL: false,
  DEPLOY: false,
  TRANSFERVALUE: false,
  SIGN: false
}
let permissions = reactive({ ...initPermissions })
type PermissionsLis = 'CHANGEOWNER'|'CHANGEPERMISSIONS' | 'ADDPERMISSIONS'|'SETDATA'|'CALL'|'STATICCALL' | 'DELEGATECALL'|'DEPLOY'|'TRANSFERVALUE'|'SIGN'
const permissionsLis:PermissionsLis[] = [
  'CHANGEOWNER',
  'CHANGEPERMISSIONS',
  'SETDATA',
  'CALL',
  'ADDPERMISSIONS',
  'STATICCALL',
  'DELEGATECALL',
  'DEPLOY',
  'TRANSFERVALUE',
  'SIGN'
]

const grantPermission = async () => {
  step.value = 1
  const { account, signer } = await getEthers()
  try {
    const result = await setKMPermission({
      account,
      signer,
      privateKey: privateKey.value,
      thirdPartyAddress: thirdPartyAddress.value,
      permissions
    })
    txHash.value = result.hash
    step.value = 2
  } catch (err:Error) {
    step.value = 0
    error.value = err
  }
}
const settingVaultPermission = async () => {
  const { account, signer } = await getEthers()
  const privateKey = process.env.VUE_APP_PRIVATE_KEY as string
  const thirdPartyAddress = '0x5481a9AAC94975B22A269229Fd717651647E303f'
  const result = await setVaultPermission(account, attr.address as string, signer, privateKey, thirdPartyAddress)
  txHash.value = result.hash
}

const clickNavBar = () => {
  emit('close', step.value)
  step.value = 0
  error.value = ''
  permissions = Object.assign(permissions, initPermissions)
}
</script>

<template>
  <div class="text-primary">
    <van-nav-bar title="Grant Permission" left-arrow @click-left="clickNavBar" />
      <van-steps :active="step" active-icon="success" class="my-2">
      <van-step>Input Infomation</van-step>
      <van-step>Granting</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>

    <div v-if="step == 0" class="mt-2">
      <NoticeBar color="#fff" background="#363636" wrapable  left-icon="info-o">
        <p> You can check the intention of all  <a class="text-theme" href="https://docs.lukso.tech/standards/universal-profile/lsp6-key-manager" target="_blaank">Permissions</a> </p>
      </NoticeBar>
      <div class="text-primary m-2">Set Permissions</div>
      <div class="grid gap-x-1.5 gap-y-2  m-3 grid-cols-1 sm:(grid-cols-2) md:(grid-cols-3)">
        <div v-for="permission in permissionsLis" :key="permission" class="flex items-center">
          <van-switch v-model="permissions[permission]" active-color="#FB9904" inactive-color="#dcdee0" />
          <span class="ml-2">{{permission}}</span>
        </div>
      </div>
      <van-field v-model="thirdPartyAddress" placeholder="0x..." label="Grant Address" />
      <van-field v-model="privateKey" placeholder="Only used to execute the contract" label="Private Key" />

      <div class="flex m-3 justify-center">
        <van-button  @click="grantPermission" :disabled="disabled">Grant Permission</van-button>
      </div>
    </div>
    <div v-if="step == 1">
      executing transactions , please be patient!
    </div>
    <div v-if="step == 2" class="break-words">
    🎉 Success: tx hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${txHash}`" target="_blank">{{
          txHash
      }}</a>
    </div>
    <p v-if="error" class="text-[red]">{{ error }}</p>
    </div>
</template>

<style scoped>
:deep(.van-button){
  --van-button-default-color: var(--color-text-primary);
  --van-button-default-background-color: var(--color-theme);
  --van-button-default-border-color: var(--color-theme);
}
:deep(.van-cell){
  --van-cell-background-color: var(--color-bg-secondary);
  --van-cell-active-color: var(--color-bg-secondary);
  --van-field-label-color: var(--color-text-primary);
  --van-field-input-text-color: var(--color-text-primary);
  --van-cell-border-color: var(--color-bg-primary);
  --van-cell-value-color:var(--color-text-primary);
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

:deep(.van-nav-bar){
  --van-nav-bar-background-color:var(--color-bg-secondary);
  --van-nav-bar-title-text-color:var(--color-text-primary);
  --van-nav-bar-icon-color:var(--color-text-primary);
}
:deep(.van-hairline--bottom:after){
  border-width: 0;
}
</style>
