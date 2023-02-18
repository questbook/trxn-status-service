import axios from 'axios'
import { safeEndpoints, safeEndpointsTest } from './constants'

const SAFES_ENDPOINTS = { ...safeEndpoints, ...safeEndpointsTest }

export async function getGnosisTokenUsdValue(safeNetworkId: string, safeAddress: string, tokenName: string) {
	const gnosisUrl = `${SAFES_ENDPOINTS[safeNetworkId]}v1/safes/${safeAddress}/balances/usd`
	const response = await axios.get(gnosisUrl)

    const tokenDetails = response.data.filter(
        (token) => token?.token?.symbol.toLowerCase() === tokenName
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
	const API_URL = `https://safe-client.safe.global/v1/chains/${safeNetworkId}/transactions/multisig_${safeAddress}_${transactionHash}/`
	const response = await axios.get(API_URL)
	const txnDetails = response.data
	console.log(txnDetails)
	const now = Date.now()
	if(txnDetails.txStatus == 'SUCCESS' || txnDetails.txStatus === 'CANCELLED') {
		return {  status: txnDetails.txStatus === 'SUCCESS' ? 1 : 2, executionTimeStamp: txnDetails.txStatus === 'SUCCESS' ? txnDetails.executedAt : now }
	} else {
		return { status: 0,  executionTimeStamp: null}
	}
}