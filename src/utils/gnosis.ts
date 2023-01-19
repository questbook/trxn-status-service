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

export async function getGnosisTransactionHashStatus(safeNetworkId: string, transactionHash: string) {
	const API_URL = `${SAFES_ENDPOINTS[safeNetworkId]}/v1/multisig-transactions/${transactionHash}/`
	const response = await axios.get(API_URL)
	const txnDetails = response.data
	if(txnDetails.isExecuted) {
		return {  status: 1, executionTimeStamp: txnDetails.executionDate }
	} else {
		return { status: 0,  executionTimeStamp: null}
	}
}