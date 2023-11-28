import Web3 from "web3";
import { CHAIN_INFO } from "./chains";
import { ExecutedTransactionType, SupportedChainId } from "./types";
import { AbiItem } from "web3-utils";
import WorkspaceRegistryAbi from "../abi/WorkspaceRegistry.json";
import {
  getGnosisTokenUsdValue,
  getGnosisTransactionHashStatus,
} from "../utils/gnosis";
import { coinGeckoId } from "../utils/constants";
import {
  getRealmTransactionHashStatus,
  getTokenUSDonDate,
} from "../utils/realms";
import { executeMutation, executeQuery,executeQueryClient } from "../utils/query";
import {
  GetFundTransfersDocument,
  GetFundTransfersQuery,
} from "../generated/graphql";
import { getTONTransactionHashStatus } from "./ton";
import { useMutation } from "@apollo/client";
import { updateFundsTransferTransactionStatus } from "../generated/mutation";
import { getFundsTransfers } from "../generated/contracts";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getDateInDDMMYYYY(date: Date) {
  return (
    `${date.getDate() + 1 < 10 ? "0" : ""}${date.getDate()}` +
    "-" +
    `${date.getMonth() + 1 < 10 ? "0" : ""}${date.getMonth() + 1}` +
    "-" +
    date.getFullYear()
  );
}

export const updateTransactionStatus = async (
  chainId: SupportedChainId,
  rpcUrl: string,
  defaultTokenName: string = "usd coin",
) => {
  const data = await executeQueryClient(
    getFundsTransfers,
  );
  console.log('data',data)

  if (!data) return;

  const fundsTransfersData = data.fundTransfers;
  let execuetedTxns: ExecutedTransactionType[] = [];
  console.log('number of pending trxns:', fundsTransfersData.length)
  for (const transfer of fundsTransfersData) {
    console.log('-----------------------------------')

    const transactionHash = transfer.transactionHash;
    const tokenName = transfer.tokenName;
    const applicationId = transfer.application.id;
    let safeChainId
    let safeAddress
    let isWalletTransaction = transactionHash.startsWith('99887341.') === true ? true : false

    if (!transfer.grant.workspace.safe && isWalletTransaction) {
      safeChainId = 512342
    }
    else {
      safeChainId = transfer.grant.workspace.safe.chainId;
      safeAddress = transfer.grant.workspace.safe.address;
    }
    try {
      await sleep(1000)
      // solana
      if (parseInt(safeChainId) === 900001) {
        const txnStatus = await getRealmTransactionHashStatus(
          safeAddress,
          transactionHash,
        );
        console.log("txnStatus", txnStatus);
        if (
          txnStatus[transactionHash].status == 1 &&
          txnStatus[transactionHash].executionTimeStamp
        ) {
          const executionTimeStamp =
            txnStatus[transactionHash].executionTimeStamp;
          const tokenUsdValue = await getTokenUSDonDate(
            coinGeckoId[tokenName ? tokenName : defaultTokenName],
            getDateInDDMMYYYY(executionTimeStamp),
          );
          console.log("tokenUsdValue", tokenUsdValue);
          execuetedTxns.push({
            applicationId,
            transactionHash,
            tokenUsdValue,
            tokenName,
            executionTimeStamp: Math.round(
              new Date(executionTimeStamp).getTime() / 1000,
            ),
            status: 'SUCCESS'
          });
        }
      }
      // ton
      if (parseInt(safeChainId) === 512341 || parseInt(safeChainId) === 512342 || parseInt(safeChainId) === 3 || isWalletTransaction) {



        let txnStatus
        if (!isWalletTransaction) {
          txnStatus =
            await getTONTransactionHashStatus(
              safeAddress,
              transactionHash,
            )
          console.log("ton - txnStatus----", safeAddress, transactionHash, txnStatus);
        }
        else txnStatus = { status: 1 }

        if (txnStatus.status == 1 || txnStatus.status === 2 || isWalletTransaction) {

          const currentDate = new Date()
          const timestamp = currentDate.getTime()

          const executionTimeStamp = isWalletTransaction === true ? timestamp : txnStatus.executionTimeStamp
          let tokenUsdValue = 0;
          if (executionTimeStamp !== null) {
            tokenUsdValue = await getTokenUSDonDate(
              coinGeckoId[tokenName],
              getDateInDDMMYYYY(new Date(executionTimeStamp)),
            );
          }
          console.log("tokenUsdValue-TON", tokenUsdValue);

          execuetedTxns.push({
            applicationId,
            transactionHash,
            tokenUsdValue,
            tokenName,
            executionTimeStamp: executionTimeStamp !== null ? Math.round(
              new Date(executionTimeStamp).getTime() / 1000,
            ) : executionTimeStamp,
            status: txnStatus.status === 1 ? 'SUCCESS' : 'CANCELLED'
          });
        }
      }
      // evm
      else {
        const txnStatus = await getGnosisTransactionHashStatus(
          safeChainId,
          safeAddress,
          transactionHash,
        );
        console.log("txnStatus", txnStatus, tokenName);
        if (txnStatus.status == 1 || txnStatus.status === 2) {
          const executionTimeStamp = txnStatus.executionTimeStamp;
          let tokenUsdValue = 0;
          if (tokenName !== null) {
            tokenUsdValue = await getGnosisTokenUsdValue(
              safeChainId,
              safeAddress,
              tokenName,
            );
          } else if (executionTimeStamp !== null) {
            tokenUsdValue = await getTokenUSDonDate(
              coinGeckoId[defaultTokenName],
              getDateInDDMMYYYY(new Date(executionTimeStamp)),
            );
          }
          console.log("tokenUsdValue-gnosis", tokenUsdValue);

          execuetedTxns.push({
            applicationId,
            transactionHash,
            tokenUsdValue,
            tokenName,
            executionTimeStamp: executionTimeStamp !== null ? Math.round(
              new Date(executionTimeStamp).getTime() / 1000,
            ) : executionTimeStamp,
            status: txnStatus.status === 1 ? 'SUCCESS' : 'CANCELLED'
          });
        }
      }
    } catch (err) {
      console.log("error", err.message, { safeChainId, safeAddress, transactionHash, tokenName, applicationId });
    }
  }

  console.log(
    "executedTxns on chain " + CHAIN_INFO[chainId].name,
    execuetedTxns,
  );
  if (execuetedTxns.length > 0) {
    const transactionHash = await updateStatusContractCall(
      chainId,
      rpcUrl,
      execuetedTxns,
    );

    console.log("update status transaction hash: ", transactionHash);
  }
};


export const updateStatusContractCall = async (
  chainId: SupportedChainId,
  rpcUrl: string,
  execuetedTxns: ExecutedTransactionType[],
) => {
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  
 const variables = {
    applicationId: execuetedTxns.map((txn) => txn.applicationId),
    transactionHash: execuetedTxns.map((txn) => txn.transactionHash),
    status: execuetedTxns.map((txn) => txn.status === 'SUCCESS' ? "executed" : "cancelled"),
    tokenUSDValue: execuetedTxns.map((txn) => Math.round(txn.tokenUsdValue)),
    executionTimestamp: execuetedTxns.map((txn) => txn.executionTimeStamp),
  }
  const data = await executeMutation(updateFundsTransferTransactionStatus, variables);
  console.log('data',data)
  return "txUpdated";
};
