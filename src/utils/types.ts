export enum SupportedChainId {
  GOERLI_TESTNET = 5,
  OPTIMISM_MAINNET = 10,
}

export type QBContract =
  | "workspace"
  | "grantFactory"
  | "applications"
  | "reviews"
  | "communication";

export interface ChainInfo {
  readonly id: SupportedChainId;
  readonly name: string;
  readonly isTestNetwork?: boolean;
  readonly icon: string;
  readonly wallets: string[];
  readonly explorer: {
    address: string;
    transactionHash: string;
  };
  readonly supportedCurrencies: {
    [address: string]: {
      icon: string;
      label: string;
      pair?: string;
      address: string;
      decimals: number;
    };
  };
  readonly qbContracts: { [C in QBContract]: string };
  readonly subgraphClientUrl: string;
  readonly rpcUrls: string[];
  readonly nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export type ChainInfoMap = { readonly [chainId: string]: ChainInfo };

export type ExecutedTransactionType = {
  applicationId: string;
  transactionHash: string;
  tokenUsdValue: number;
  tokenName: string;
  executionTimeStamp: number;
  status: 'SUCCESS' | 'CANCELLED'
};
