<script setup lang="ts">
import { ethers } from 'ethers'
import { ERC725 } from '@erc725/erc725.js'
import type { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP3UniversalProfileMetaDataSchema from '@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json'
import { reactive } from 'vue'
import { IPFS_GATEWAY_BASE_URL } from '../utils/config'
import { Tag, Toast } from 'vant'
import { useClipboard } from '@vueuse/core'
import { handlerIPFSImg } from '@/utils'
const ethereumProvider = new ethers.providers.Web3Provider(window.ethereum)
const accounts = await ethereumProvider.listAccounts()
const address = accounts[0]
const profile = new ERC725(LSP3UniversalProfileMetaDataSchema as ERC725JSONSchema[], address, ethereumProvider.provider, {
  ipfsGateway: IPFS_GATEWAY_BASE_URL // todo the gateway should be without /ipfs/
})
interface Image {
  hash:string
  url:string
  hashFunction: string
  height:number
  width:number
}

interface LSP3Profile {
  address:string
  description:string
  name:string
  tags: string[]
  backgroundImage:Image[]
  profileImage:Image[]
  links:{title:string, url:string}[]
}

let info = reactive<LSP3Profile>({
  address: '',
  description: '',
  name: '',
  tags: [],
  backgroundImage: [],
  profileImage: [],
  links: []
})
info.address = address
const { copy, copied } = useClipboard({ source: address })
try {
  const metaData = await profile.fetchData('LSP3Profile')
  const result = await profile.fetchData('LSP1UniversalReceiverDelegate')
  console.log('LSP1UniversalReceiverDelegate', result)

  info = {
    ...info,
    ...metaData.value?.LSP3Profile
  }
} catch (e) {
  console.log(e)
}

const copyHandler = () => {
  copy()
  if (copied) return Toast.success('copied!')
}
</script>

<template>
  <div class="mx-auto w-full relative">
    <van-image
      class="h-[55vw] w-full sm:(h-300px)"
      :src="handlerIPFSImg(info.backgroundImage[0]?.url)"/>
    <div class="flex flex-col mt-[8%] text-primary w-full inset-0 absolute items-center">
      <div class="rounded-full mx-auto h-[20vw] w-[20vw] overflow-hidden sm:(w-[129px] h-[129px]) ">
        <van-image
        round
          class="h-full w-full"
          :src="handlerIPFSImg(info.profileImage[0]?.url)"
          />
      </div>
      <div class="mt-5 text-center text-[white] mb-1">
        <div class="text-shadow-lg">
          {{ `${info.address.slice(0,8)}...${info.address.slice(-6)}` }}
          <van-icon name="link-o" @click="copyHandler" class="cursor-pointer"/>
        </div>
        <div class="text-shadow-lg">{{ info.name }}</div>
        <div class="mt-1 text-sm">
          <Tag class="mr-1" v-for="(item,index) in info.tags" :key="index">{{item }}</Tag>
        </div>
      </div>
    </div>
  </div>
</template>
