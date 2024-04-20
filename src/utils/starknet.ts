import axios from 'axios'
import { safeEndpoints, safeEndpointsTest } from './constants'

const SAFES_ENDPOINTS = { ...safeEndpoints, ...safeEndpointsTest }

export async function getStarknetTransactionStatus(safeNetworkId: string, safeAddress: string, transactionHash: string){
    try{

        const check = await checkStarknetTransactionStatus(safeNetworkId, safeAddress, transactionHash)
        if(!check){
            return { status: 0,  executionTimeStamp: null}
        }

        const txHash = check.keys
        const response = await axios.post(
            `${SAFES_ENDPOINTS[safeNetworkId]}`,
            {
              'method': 'starknet_call',
              'jsonrpc': '2.0',
              'params': {
                'request': {
                  'contract_address': safeAddress,
                  'entry_point_selector': '0xf2b9091012018788c1c6b4c5d66a0bb2b5e8d818f97e0f460f94fcdf49fee5',
                  'calldata': []
                },
                'block_id': 'pending'
              },
              'id': 0
            },
          );

    if(txHash?.map((hash: string) => response?.data?.result?.includes(hash)).includes(true)){
       return { status: 0,  executionTimeStamp: null}
    } else {
       return { status: 1,  executionTimeStamp: new Date().getTime() }
    }
          


    } catch (e) {
      return { status: 0,  executionTimeStamp: null}
    }
}

export async function checkStarknetTransactionStatus(safeNetworkId: string, safeAddress: string, transactionHash: string){
    try{
        const response = await axios.post(
            `${SAFES_ENDPOINTS[safeNetworkId]}`,
          {
            'jsonrpc': '2.0',
            'id': 0,
            'method': 'starknet_getTransactionReceipt',
            'params': [
              transactionHash
            ]
          });
        if(response?.data?.result?.events){
            return response?.data?.result?.events[0]
        } else {
            return false
        }
    } catch (e) {
        console.log('error',e)
        return false
    }
}
