import { gql } from '@apollo/client'
export const updateFundsTransferTransactionStatus = gql`
mutation updateFundTransferTransactionStatus($applicationId: [String!]!, $transactionHash: [String!]!, $status: [String!]!, $tokenUSDValue: [Float!]!, $executionTimestamp: [Float!]!) {
	updateFundTransferTransactionStatus(
			applicationId: $applicationId
			transactionHash: $transactionHash
			status: $status
			tokenUSDValue: $tokenUSDValue
			executionTimestamp: $executionTimestamp
		){
		numAffected
	}
}`

	