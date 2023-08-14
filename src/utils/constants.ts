export const coinGeckoId = {
    "usd coin": "usd-coin",
    "sol":"solana",
    "cusd":"celo-dollar",
    "ceuro":"celo-euro",
    "tether":"tether",
    'ton':'the-open-network',
    'TON':'the-open-network', // TON
    'the-open-network':'the-open-network', // TON
}
// reference: https://docs.safe.global/safe-core-api/available-services
export const safeEndpoints = {
    "1": "https://safe-transaction-mainnet.safe.global/api/",
    "40": "https://transaction.safe.telos.net/api/",
    "42161": "https://safe-transaction-arbitrum.safe.global/api/",
    "43114": "https://safe-transaction-avalanche.safe.global/api/",
    "1313161554": "https://safe-transaction-aurora.safe.global/api/",
    "56": "https://safe-transaction-bsc.safe.global/api/",
    "10": "https://safe-transaction-optimism.safe.global/api/",
    "137": "https://safe-transaction-polygon.safe.global/api/",
    "42220": "https://safe-transaction-aurora.safe.global/api/",
    "4689": "https://transaction.safe.iotex.io/api/",
    '512341': 'https://graphql.tonkey.app/graphql/' // TON mainnet
    
}

export const safeEndpointsTest = {
    "4": "https://safe-transaction.rinkeby.gnosis.io/api/",
    "5": "https://safe-transaction.goerli.gnosis.io/api/",
    "73799": "https://safe-transaction.volta.gnosis.io/api/",
    "4690": "https://transaction-testnet.safe.iotex.io/api/",
    "512342": 'https://graphql.tonkey.app/graphql/', // TON testnet
    "3": 'https://graphql.tonkey.app/graphql/' // TON testnet - dev
}