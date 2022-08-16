<script setup lang="ts">
import { onMounted, ref } from 'vue'
import LSP10ReceivedVaultsSchema from '@erc725/erc725.js/schemas/LSP10ReceivedVaults.json'
import ERC725, { ERC725JSONSchema } from '@erc725/erc725.js'
import { getEthers } from '@/composables/ethers'
import { createMyVault } from '@/composables/createEOA'

const disabled = ref(false)
onMounted(async () => {
  await getVaults()
})

const getVaults = async () => {
  const { provider, account } = await getEthers()
  const controller = new ERC725(LSP10ReceivedVaultsSchema as ERC725JSONSchema[], account, provider)
  console.log('controller:', controller)
  const metaData = await controller.fetchData([
    'LSP10Vaults[]'
  ])
  console.log('metaData:', metaData)
}

const createVault = async () => {
  disabled.value = true
  const { account, signer } = await getEthers()
  const deploy = await createMyVault(account, signer)
  console.log('deploy:', deploy)
  disabled.value = false
}
</script>

<template>
  <div>
    <van-button type="primary" @click="createVault" :disabled="disabled">Create Own Vault</van-button>

  </div>
</template>
