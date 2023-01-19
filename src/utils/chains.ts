import chainInfo from '../generated/chainInfo.json';
import { ChainInfoMap } from './types';

export const CHAIN_INFO = chainInfo as ChainInfoMap;

export const ALL_SUPPORTED_CHAIN_IDS: number[] = Object.values(CHAIN_INFO)
  .map(({ id }) => id)
  .filter((id) => process.env.IS_TEST === 'true' || !CHAIN_INFO[id].isTestNetwork);
