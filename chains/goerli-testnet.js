import axios from "axios";
import { load } from "js-yaml";
import Web3 from "web3";
import dotenv from "dotenv";
import workspaceRegistryAbi from "../abi/WorkspaceRegistry.json" assert { type: "json" };
import { getTokenUSDonDate, getRealmTransactionHashStatus} from "../safe/realms.js";
import coinGeckoId from "../constants/coinGeckoId.json" assert { type: "json" };
import { getCeloTokenUsdValue, getGnosisTokenUsdValue, getGnosisTransactionHashStatus } from "../safe/gnosis.js";
import { getDateInDDMMYYYY, sleep, getFundTransferData } from "../utils.js";

dotenv.config();

const address = process.env.WALLET_PUBLIC_KEY;
const privateKey = process.env.WALLET_PRIVATE_KEY;
const goerliRpcUrl = process.env.GOERLI_RPC_URL;
const network = "goerli-testnet";
const CHAINS_JSON_URL = "https://raw.githubusercontent.com/questbook/chains/main/chains/{{network}}.yaml";
const SUBGRAPH_URL = `https://the-graph.questbook.app/subgraphs/name/qb-subgraph-${network}`;

const goerliTrxnStatus = async (event, context) => {
    const fundsTransfersData = await getFundTransferData(SUBGRAPH_URL);
    let queuedTransfers =  fundsTransfersData.filter((txn) => txn.status === "queued");
    let execuetedTxns = [];

    await Promise.all(queuedTransfers.map(async (transfer) => {

        try{
            const safeChainId =  transfer.grant.workspace.safe.chainId;
            const safeAddress = transfer.grant.workspace.safe.address;
            const transactionHash = transfer.transactionHash;
            const tokenName = transfer.tokenName;
            const applicationIds = transfer.grant.applications.map(
                (application) => application.id
            );

            if(safeChainId === "900001"){
                await sleep(200);
                const txnStatus = await getRealmTransactionHashStatus(safeAddress, transactionHash);
                console.log("txnStatus", txnStatus);
                if(txnStatus[transactionHash].status == 1 && txnStatus[transactionHash].executionTimeStamp){
                    const executionTimeStamp = txnStatus[transactionHash].executionTimeStamp;
                    const tokenUsdValue = await getTokenUSDonDate(
                                            coinGeckoId[tokenName?tokenName:"usd coin"],
                                            getDateInDDMMYYYY(executionTimeStamp));
                    console.log('tokenUsdValue', tokenUsdValue);
                    applicationIds.map(applicationId => {
                        execuetedTxns.push({
                            applicationId,
                            transactionHash,
                            tokenUsdValue,
                            tokenName,
                            executionTimeStamp:Math.round(new Date(executionTimeStamp).getTime()/1000)
                        })
                    })
                }
            }else {
                await sleep(200);
                const txnStatus = await getGnosisTransactionHashStatus(safeChainId, transactionHash);
                console.log("txnStatus", txnStatus);
                if(txnStatus.status == 1 && txnStatus.executionTimeStamp){
                    const executionTimeStamp = txnStatus.executionTimeStamp;
                    let tokenUsdValue = 0;
                    if(tokenName!==null){
                        tokenUsdValue = await getGnosisTokenUsdValue(safeChainId, safeAddress, tokenName)
                    }else{
                        tokenUsdValue = await getTokenUSDonDate(coinGeckoId["usd coin"],getDateInDDMMYYYY(new Date(executionTimeStamp)));
                    }
                    console.log('tokenUsdValue-gnosis', tokenUsdValue);

                    applicationIds.map(applicationId => {
                        execuetedTxns.push({
                            applicationId,
                            transactionHash,
                            tokenUsdValue,
                            tokenName,
                            executionTimeStamp:Math.round(new Date(executionTimeStamp).getTime()/1000)
                        })
                    })
                    
                }
            }
        }catch(err){
            // console.log(err.message);
        }
    })
    );

    console.log("execuetedTxns on chain "+network, execuetedTxns);
    if(execuetedTxns.length>0){
        const transactionHash = await updateStatusContractCall(execuetedTxns);
    }
}

const updateStatusContractCall = async (execuetedTxns) => {
    const web3 = new Web3(goerliRpcUrl);
    const networkId = await web3.eth.net.getId();
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const balance = await web3.eth.getBalance(account.address);
    console.log("Balance: ", web3.utils.fromWei(balance, "ether"));

    const url = CHAINS_JSON_URL.replace("{{network}}", network);

    const { data: yamlStr } = await axios.get(url, { responseType: "text" });
    const chainYaml = load(yamlStr);

    const workspaceContractAddress = chainYaml.qbContracts.workspace.address;
    const workspaceContract = new web3.eth.Contract(workspaceRegistryAbi, workspaceContractAddress);

    const trxn = await workspaceContract.methods.updateFundsTransferTransactionStatus(
        execuetedTxns.map((txn) => parseInt(txn.applicationId)),
        execuetedTxns.map((txn)=> txn.transactionHash),
        execuetedTxns.map(()=> "executed"),
        execuetedTxns.map((txn)=> Math.round(txn.tokenUsdValue)),
        execuetedTxns.map((txn)=> txn.executionTimeStamp),
    )
    const gas = await trxn.estimateGas({ from: address });
    const gasPrice = await web3.eth.getGasPrice();
    const data = trxn.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);

    const signedTx = await web3.eth.accounts.signTransaction({
        to: workspaceContractAddress,
        data,
        gas,
        gasPrice,
        nonce,
        chainId: networkId
    }, privateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("transaction hash: ", receipt.transactionHash);
    return receipt.transactionHash;
}

export default goerliTrxnStatus;
