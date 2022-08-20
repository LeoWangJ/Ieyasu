<script setup lang="ts">
import LSP0ERC725Account from '@lukso/lsp-smart-contracts/artifacts/UniversalProfile.json' // TODO change to LSP0ERC725Account
import { DeploymentEvent, LSPFactory } from '@lukso/lsp-factory.js'
import ERC725js, { ERC725JSONSchema } from '@erc725/erc725.js'
import LSP12IssuedAssetsSchema from '@erc725/erc725.js/schemas/LSP12IssuedAssets.json' // https://docs.lukso.tech/tools/erc725js/schemas
import { IPFS_GATEWAY_BASE_URL, IPFS_GATEWAY_API_BASE_URL, BLOCKCHAIN_EXPLORER_BASE_URL, INTERFACEID } from '@/utils/config'
import { addLuksoL16Testnet, isLuksoNetwork } from '@/utils/network'
import { useRouter } from 'vue-router'
import { onMounted, reactive, ref } from 'vue'
import { getEthers } from '@/composables/ethers'
import { ethers } from 'ethers'
import { Toast, UploaderFileListItem } from 'vant'
const router = useRouter()

const isEOA = ref(false)
const isL16Network = ref(true)
const isSuccess = ref(false)
const isDeploying = ref(false)
const error = ref('')
const step = ref(0)
const deployEvent = ref<DeploymentEvent[]>([])
const disabled = ref(false) // TODO init need true
interface TokenInfo {
  name: string
  symbol: string
  description: string
  icon: UploaderFileListItem[]
}
const tokenInfo = reactive<TokenInfo>({
  name: '',
  symbol: '',
  description: '',
  icon: []
})

onMounted(async () => {
  await checkNetwork()
})

const checkNetwork = async () => {
  isL16Network.value = await isLuksoNetwork()
}

const deploy = async () => {
  isDeploying.value = true
  const { account, chainId, ethereumProvider } = await getEthers()
  const factory = new LSPFactory(ethereumProvider, { chainId })
  try {
    await factory.LSP7DigitalAsset.deploy({
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      controllerAddress: account,
      creators: [account],
      isNFT: false,
      digitalAssetMetadata: {
        description: tokenInfo.description,
        icon: tokenInfo.icon[0]?.file,
        links: [],
        images: [],
        assets: []
      }
    }, {
      LSP7DigitalAsset: {
        version: undefined
      },
      ipfsGateway: IPFS_GATEWAY_API_BASE_URL,
      onDeployEvents: {
        next: (deploymentEvent) => {
          console.log('deploymentEvent:', deploymentEvent)

          step.value = 1
          deployEvent.value.push(deploymentEvent)
        },
        error: (err:Error) => {
          console.log('error', err)
          isDeploying.value = false
          error.value = err.message
        },
        complete: async (contracts) => {
          console.log('Deployment Complete')
          console.log(contracts.LSP7DigitalAsset)
          await transaction(contracts.LSP7DigitalAsset.address)
        }
      }
    })
  } catch (err:Error) {
    isDeploying.value = false
    error.value = err.message
  }
}
const transaction = async (deployedAssetAddress: string) => {
  const { account, provider, signer, isEOAccount } = await getEthers()

  const LSP12controller = new ERC725js(LSP12IssuedAssetsSchema as ERC725JSONSchema[], account, provider, {
    ipfsGateway: IPFS_GATEWAY_BASE_URL
  })

  // GET the current issued assets
  let LSP12IssuedAssets
  try {
    LSP12IssuedAssets = await LSP12controller.getData('LSP12IssuedAssets[]')
  } catch (err) {
    // Is EOA
    // Load all assets that were stored in local storage
    LSP12IssuedAssets = JSON.parse(localStorage.getItem('issuedAssets'))
  }
  // add new asset
  LSP12IssuedAssets.value.push(deployedAssetAddress)
  console.log('LSP12IssuedAssets:', LSP12IssuedAssets)

  if (isEOAccount) {
    localStorage.setItem('issuedAssets', JSON.stringify(LSP12IssuedAssets))
  }
  const encodedErc725Data = LSP12controller.encodeData([
    {
      keyName: 'LSP12IssuedAssets[]',
      value: LSP12IssuedAssets.value
    },
    {
      keyName: 'LSP12IssuedAssetsMap:<address>',
      dynamicKeyParts: deployedAssetAddress,
      value: [INTERFACEID.LSP7DigitalAsset, (LSP12IssuedAssets.length - 1) as unknown as string]
    }
  ])
  console.log('encodedErc725Data:', encodedErc725Data)
  // SEND transaction
  try {
    const profileContract = new ethers.Contract(account, LSP0ERC725Account.abi, signer)
    console.log('profileContract:', profileContract)

    const receipt = await profileContract['setData(bytes32[],bytes[])'](encodedErc725Data.keys, encodedErc725Data.values, {
      gasLimit: 300_0000
    })
    console.log('receipt:', receipt)
    step.value = 2
    deployEvent.value.push({ receipt, type: 'TRANSACTION', functionName: 'setData' })
  } catch (err:Error) {
    console.log(err)
    error.value = err.message
    return
  }
  // Show EOA local storage warning
  if (isEOAccount) {
    isEOA.value = true
  }
  step.value = 3
  isDeploying.value = false
  isSuccess.value = true
  Toast.success('success!')
}
</script>

<template>
  <van-nav-bar title="Create Token" left-arrow @click-left="router.push({name:'home'})"/>
  <div v-if="isEOA" >The Token has been deployed and configured correctly, but because of MetaMask, the asset can only be stored in the browser's local storage.</div>
  <div v-if="!isDeploying && !deployEvent.length">
    <div v-if="isL16Network" >
        <h2>Create your own ERC20-like Token based on <a class="text-theme" href="https://docs.lukso.tech/standards/nft-2.0/LSP7-Digital-Asset" target="_blank">LSP7</a></h2>
        <van-field v-model="tokenInfo.name" placeholder="Name" />
        <van-field v-model="tokenInfo.symbol" placeholder="Token Symbol" />
        <van-field v-model="tokenInfo.description" placeholder="Description" />
      <div>Token Icon</div>
      <van-uploader v-model="tokenInfo.icon" multiple :max-count="2" />
      <van-button type="primary" @click="deploy" :disabled="disabled">DEPLOY TOKEN</van-button>
    </div>
    <p v-else>
      Please switch your network to LUKSO <span class="cursor-pointer text-theme" @click="addLuksoL16Testnet">L16 </span>to create this token.
    </p>
  </div>
  <div v-else>
    <van-steps :active="step" active-icon="success" active-color="#38f">
      <van-step>Deploying</van-step>
      <van-step>Deployed</van-step>
      <van-step>Transaction</van-step>
      <van-step>🎉 Success</van-step>
    </van-steps>
    <div>
      <p>Deploying Smart Contracts... </p>
      <strong>Please confirm all transactions in your browser extension, and wait until they are added to the Blockchain.</strong>
    </div>
    <div v-for="(event, index) in deployEvent" :key="index">
      <span v-if="event.type === 'PROXY_DEPLOYMENT' && event.status === 'COMPLETE'">
        Contract deployed: {{ event.contractName }} ({{ event.type }}): <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/address/${event.contractAddress}`" target="_blank">{{ event.contractAddress }}</a
        ><br />
        Transaction hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${event.receipt.transactionHash}`" target="_blank">{{ event.receipt.transactionHash }}</a>
      </span>
      <br />
      <span v-if="event.type === 'TRANSACTION' && event.status === 'COMPLETE'">
        Function called: {{ event.functionName }}()<br />
        Transaction hash: <a class="text-theme" :href="`${BLOCKCHAIN_EXPLORER_BASE_URL}/tx/${event.receipt.transactionHash}`" target="_blank">{{ event.receipt.transactionHash }}</a>
      </span>
      <span v-if="event.type === 'TRANSACTION' && event.status === 'PENDING'">
        Function is calling: {{ event?.functionName }}()... WAIT IT!<br />
      </span>
    </div>
    <div v-if="isSuccess">🎉 Success !!</div>
  </div>
  <p v-if="error" class="text-[red]">{{error}}</p>
</template>
