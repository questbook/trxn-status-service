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
import { executeQuery } from "../utils/query";
import {
  GetFundTransfersDocument,
  GetFundTransfersQuery,
} from "../generated/graphql";

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
  const data: GetFundTransfersQuery = await executeQuery(
    chainId,
    GetFundTransfersDocument,
  );
  console.log("fundsTransfersData", data);

  if (!data) return;

  const fundsTransfersData = data.fundsTransfers;
  let execuetedTxns: ExecutedTransactionType[] = [];

  for (const transfer of fundsTransfersData) {
    try {
      const safeChainId = transfer.grant.workspace.safe.chainId;
      const safeAddress = transfer.grant.workspace.safe.address;
      const transactionHash = transfer.transactionHash;
      const tokenName = transfer.tokenName;
	  const applicationId = transfer.application.id

	  await sleep(1000)
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
		  });
        }
      } else {
        const txnStatus = await getGnosisTransactionHashStatus(
          safeChainId,
          transactionHash,
        );
        console.log("txnStatus", txnStatus);
        if (txnStatus.status == 1 && txnStatus.executionTimeStamp) {
          const executionTimeStamp = txnStatus.executionTimeStamp;
          let tokenUsdValue = 0;
          if (tokenName !== null) {
            tokenUsdValue = await getGnosisTokenUsdValue(
              safeChainId,
              safeAddress,
              tokenName,
            );
          } else {
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
			executionTimeStamp: Math.round(
			  new Date(executionTimeStamp).getTime() / 1000,
			),
		  });
        }
      }
    } catch (err) {
      console.log("error", err.message);
    }
  }

  console.log(
    "executedTxns on chain " + CHAIN_INFO[chainId].name,
    execuetedTxns,
  );
//   if (execuetedTxns.length > 0) {
//     const transactionHash = await updateStatusContractCall(
//   	chainId,
//   	rpcUrl,
//   	execuetedTxns,
//     );
//   }
};

export const updateStatusContractCall = async (
  chainId: SupportedChainId,
  rpcUrl: string,
  execuetedTxns: ExecutedTransactionType[],
) => {
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  if (!privateKey) {
	console.error('Wallet address or private key not found')
	return;
  }

  const web3 = new Web3(rpcUrl);
  const networkId = await web3.eth.net.getId();
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  const balance = await web3.eth.getBalance(account.address);
  const address = account.address;
  console.log("Balance: ", web3.utils.fromWei(balance, "ether"));

  const workspaceContractAddress = CHAIN_INFO[chainId].qbContracts.workspace;
  const workspaceContract = new web3.eth.Contract(
    WorkspaceRegistryAbi as AbiItem[],
    workspaceContractAddress,
  );

  const trxn =
    await workspaceContract.methods.updateFundsTransferTransactionStatus(
      execuetedTxns.map((txn) => parseInt(txn.applicationId)),
      execuetedTxns.map((txn) => txn.transactionHash),
      execuetedTxns.map(() => "executed"),
      execuetedTxns.map((txn) => Math.round(txn.tokenUsdValue)),
      execuetedTxns.map((txn) => txn.executionTimeStamp),
    );
  const gas = await trxn.estimateGas({ from: address });
  const gasPrice = await web3.eth.getGasPrice();
  const data = trxn.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address);

  const signedTx = await web3.eth.accounts.signTransaction(
    {
      to: workspaceContractAddress,
      data,
      gas,
      gasPrice,
      nonce,
      chainId: networkId,
    },
    privateKey,
  );

  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
  console.log("transaction hash: ", receipt.transactionHash);
  return receipt.transactionHash;
};
