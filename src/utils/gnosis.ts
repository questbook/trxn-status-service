import axios from 'axios'
import { safeEndpoints, safeEndpointsTest } from './constants'

const SAFES_ENDPOINTS = { ...safeEndpoints, ...safeEndpointsTest }

export async function getGnosisTokenUsdValue(safeNetworkId: string, safeAddress: string, tokenName: string) {
	const gnosisUrl = `https://safe-client.safe.global/v1/chains/${safeNetworkId}/safes/${safeAddress}/balances/usd`
	console.log(gnosisUrl)
	const response = await axios.get(gnosisUrl)
	const tokenDetails = response.data.items.filter(
		(token) => token?.tokenInfo?.symbol.toLowerCase() === tokenName
	)
	return tokenDetails.length>0? tokenDetails[0].fiatConversion : null

}

export async function getCeloTokenUsdValue(safeNetworkId: string, safeAddress: string, tokenName: string) {
	const gnosisUrl = `${SAFES_ENDPOINTS[safeNetworkId]}v1/safes/${safeAddress}/balances/usd`
	const response = await axios.get(gnosisUrl)

    const tokenDetails = response.data.filter(
        (token) => token?.token?.symbol.toLowerCase() === tokenName
    )
	return tokenDetails.length>0? tokenDetails[0].fiatConversion : null

}

export async function getGnosisTransactionHashStatus(safeNetworkId: string, safeAddress: string, transactionHash: string) {
	let API_URL: string
	if (safeNetworkId === '4689' || safeNetworkId === '4690') {
		API_URL = `https://gateway.safe.iotex.io/v1/chains/${safeNetworkId}/transactions/multisig_${safeAddress}_${transactionHash}`
	} else {
	  	API_URL = `https://safe-client.safe.global/v1/chains/${safeNetworkId}/transactions/multisig_${safeAddress}_${transactionHash}/`
	}
	const response = await axios.get(API_URL)
	const txnDetails = response.data
	const now = Date.now()
	console.log("status", { safeNetworkId, safeAddress, transactionHash, txStatus: txnDetails.txStatus, txInfo: txnDetails.txInfo.isCancellation, executedAt: txnDetails.executedAt, now })
	
	if(txnDetails.txStatus == 'SUCCESS' || txnDetails.txStatus === 'CANCELLED') {
		return {  status: (txnDetails.txStatus === 'CANCELLED' || txnDetails.txStatus === 'SUCCESS' && txnDetails.txInfo?.isCancellation) ? 2 : 1, executionTimeStamp: txnDetails.txStatus === 'SUCCESS' ? txnDetails.executedAt : now }
	} else {
		return { status: 0,  executionTimeStamp: null}
	}
}