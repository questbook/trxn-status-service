import axios from 'axios'
import SAFES_ENDPOINTS_MAINNETS from '../constants/safesEndPoints.json' assert { type: "json" };
import SAFES_ENDPOINTS_TESTNETS from '../constants/safesEndPointsTest.json' assert { type: "json" };

const SAFES_ENDPOINTS = { ...SAFES_ENDPOINTS_MAINNETS, ...SAFES_ENDPOINTS_TESTNETS }

export async function getGnosisTokenUsdValue(safeNetworkId, safeAddress, tokenName) {
	const gnosisUrl = `${SAFES_ENDPOINTS[safeNetworkId]}v1/safes/${safeAddress}/balances/usd`
	const response = await axios.get(gnosisUrl)

    const tokenDetails = response.data.filter(
        (token) => token?.token?.symbol.toLowerCase() === tokenName
    )
	return tokenDetails.length>0? tokenDetails[0].fiatConversion : null

}

export async function getCeloTokenUsdValue(safeNetworkId, safeAddress, tokenName) {
	const gnosisUrl = `${SAFES_ENDPOINTS[safeNetworkId]}v1/safes/${safeAddress}/balances/usd`
	const response = await axios.get(gnosisUrl)

    const tokenDetails = response.data.filter(
        (token) => token?.token?.symbol.toLowerCase() === tokenName
    )
	return tokenDetails.length>0? tokenDetails[0].fiatConversion : null

}


export async function getGnosisTransactionHashStatus(safeNetworkId, transactionHash) {
	const API_URL = `${SAFES_ENDPOINTS[safeNetworkId]}/v1/multisig-transactions/${transactionHash}/`
	const response = await axios.get(API_URL)
	const txnDetails = response.data
	if(txnDetails.isExecuted) {
		return {  status: 1, executionTimeStamp: txnDetails.executionDate }
	} else {
		return { status: 0,  executionTimeStamp: null}
	}
}