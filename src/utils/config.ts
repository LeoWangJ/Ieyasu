export const IPFS_GATEWAY_BASE_URL = 'https://2eff.lukso.dev/ipfs/'
export const IPFS_GATEWAY_API_BASE_URL = 'https://api.2eff.lukso.dev:443'

export const BLOCKCHAIN_EXPLORER_BASE_URL = 'https://blockscout.com/lukso/l14'

export const INTERFACEID = {
  LSP7DigitalAsset: '0xe33f65c3',
  LSP8IdentifiableDigitalAsset: '0x49399145'
}

export const COMMON_ABIS = {
  supportsInterface: {
    inputs: [
      {
        internalType: 'bytes4',
        name: 'interfaceId',
        type: 'bytes4'
      }
    ],
    name: 'supportsInterface',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
}
export const LSP8MetadataJSONSchema = {
  name: 'LSP8MetadataJSON:<bytes32>',
  key: '0x9a26b4060ae7f7d5e3cd0000<bytes32>',
  keyType: 'Mapping',
  valueType: 'bytes',
  valueContent: 'JSONURL'
}

export const CHAIN_IDS = {
  L14: 22,
  L14_HEX: '0x16',
  L16: 2828,
  L16_HEX: '0xb0c'
}

export const RPC_URLS = {
  L16: 'https://rpc.l16.lukso.network'
}

export const BLOCK_EXPLORER_URLS = {
  L16: 'https://explorer.execution.l16.lukso.network'
}
