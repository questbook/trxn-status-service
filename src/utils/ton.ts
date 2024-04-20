import fetch from 'cross-fetch';
const baseUrl = 'https://graphql.tonkey.app/graphql'

async function queryTonkey(baseUrl, queryString, variables) {
    const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: queryString,
            variables: variables,
        }),
    });

    if (response.status === 200) {
        const result = await response.json();
        if (result.error) {
            console.log(result.error);
            throw new Error('GraphQL API Failed');
        }
        return result;
    }

    return null;
}

async function getTransactionHistory(safeAddress: string) {
    const queryString = `query TransactionHistory($chainId: String!, $safeAddress: String!) {
      transactionHistory(chainId: $chainId, safeAddress: $safeAddress) {
        details {
          from
          to
          value
          dataHex
          hash
          executedAt
          fee
          exitCode
        }
        summary {
          createdAt
          multiSigExecutionInfo {
            orderCellBoc
            queryId
            expiredAt
            confirmationsRequired
            confirmationsSubmitted
            confirmations
            executor
            remark
          }
          status
          transactionInfo {
            ... on Transfer {
              transactionType
              sender
              recipient
              direction
              transferInfo {
                ... on NativeTransferInfo {
                  transferType
                  value
                }
                ... on FTTransferInfo {
                  transferType
                  tokenAddress
                  tokenName
                  tokenSymbol
                  logoUri
                  decimals
                  value
                }
                ... on NFTTransferInfo {
                  transferType
                  tokenAddress
                  tokenName
                  tokenSymbol
                  logoUri
                  tokenId
                }
              }
            }
            ... on Creation {
              transactionType
              creator
            }
            ... on Cancellation {
              transactionType
              isCancellation
            }
          }
        }
      }
    }`;

    const variables = {
        chainId: '-239',
        safeAddress: safeAddress,
    };

    const result = await queryTonkey(baseUrl, queryString, variables);

    return result.data.transactionHistory;
}

export async function getTONTransactionHashStatus(
    safeAddress: string,
    queryId: string,
    createdAtS: number,
) {
    console.log('new version',safeAddress)
    const transactionsInHistory = await getTransactionHistory(safeAddress)
    for (const transaction of transactionsInHistory) {
        const { summary: { multiSigExecutionInfo }, details:{executedAt} } = transaction;
        if (queryId === multiSigExecutionInfo?.queryId) {
            return {
                status:1,
                executionTimeStamp: executedAt
            }
        }
    }
    console.log('createdAtS',createdAtS, Date.now() / 1000 - 1209600, Date.now() / 1000 - 1209600 > createdAtS)
    // if the createdAtS is older than 2 weeks, we assume the transaction failed
    if ((Date.now() / 1000) - 1209600 > createdAtS) {
        return {
            status:3,
            executionTimeStamp: createdAtS * 1000
        }
    }
 
    return {
        status:0,
        executionTimeStamp:null
    }
}
