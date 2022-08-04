<script setup lang="ts">
import { ethers } from 'ethers'
import { ERC725 } from '@erc725/erc725.js'
import LSP5ReceivedAssetsSchema from '@erc725/erc725.js/schemas/LSP5ReceivedAssets.json'

// const universalProfileAddress = ''
console.log(ethers, LSP5ReceivedAssetsSchema, ERC725)

const provider = new ethers.providers.Web3Provider(window.ethereum)
console.log(provider)
// const erc725LSP12IssuedAssets = new ERC725js(LSP5ReceivedAssetsSchema, universalProfileAddress, provider);
</script>

<template>
  <div>personal file</div>
</template>
