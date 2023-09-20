import axios from 'axios'
import { safeEndpoints, safeEndpointsTest } from './constants'
const SAFES_ENDPOINTS = { ...safeEndpoints, ...safeEndpointsTest }

export async function getTONTransactionHashStatus(
    safeNetworkId: string,
    queryId: string
) {

    const response = await axios.post(`${SAFES_ENDPOINTS[safeNetworkId]}`, 
        {
            query: `query singleTransaction($queryId:String!) {  singleTransaction(queryId: $queryId) {    summary {      createdAt multiSigExecutionInfo {        orderCellBoc        queryId        expiredAt        confirmationsRequired        confirmationsSubmitted        confirmations        executor        }      status      transactionInfo {        ... on Transfer {          transactionType          sender          recipient          direction          transferInfo {            ... on NativeTransferInfo {              transferType              value              }            ... on FTTransferInfo {              transferType              tokenAddress              tokenName              tokenSymbol              logoUri              decimals              value              }            ... on NFTTransferInfo {              transferType              tokenAddress              tokenName              tokenSymbol              logoUri              tokenId              }            }          }        ... on Creation {          transactionType          creator          }        ... on Cancellation {          transactionType          isCancellation          }        }      }    details {      from      to      value      dataHex      hash      executedAt      fee      }    }}`,
            variables: { queryId },
        },
    );
    const status = response.data.data.singleTransaction.summary.status
    if(status === 'SUCCESS' || status === 'CANCELLED') {
        return {
            status: status === 'CANCELLED' ? 2 : 1,
            executionTimeStamp: response.data.data.singleTransaction.summary.createdAt,
        }
    }
    else{
        return {
            status: 0,
            executionTimeStamp: null,
        }
    }
}
