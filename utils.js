import axios from "axios";

export function sleep(ms) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {resolve();}, ms);
    });
}

export function getDateInDDMMYYYY (date) {
	return `${date.getDate()+1<10?"0":""}${date.getDate()}`+"-"+ `${date.getMonth()+1<10?"0":""}${date.getMonth()+1}`+"-"+ date.getFullYear()
}

export const getFundTransferData = async (SUBGRAPH_URL) => {
  const data = await axios.post(SUBGRAPH_URL, {
      query: `query MyQuery {
          fundsTransfers {
            executionTimestamp
            transactionHash
            tokenUSDValue
            tokenName
            status
            grant {
              workspace {
                safe {
                  address
                  chainId
                }
              }
              applications {
                id
              }
            }
          }
        }`,
    }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

  
  return data.data.data.fundsTransfers;
}
