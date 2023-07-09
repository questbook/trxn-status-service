import {
	getGovernanceAccounts,
	getRealm,
	Governance,
	Proposal,
	pubkeyFilter,
} from '@solana/spl-governance';
import { Connection,  PublicKey } from '@solana/web3.js';
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

const connection = new Connection(process.env.SOLANA_RPC_URL, "recent");
const programId = new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw');

async function initialiseAllProposals(realmAddress: string) {
    const realmData = await getRealm(connection, new PublicKey(realmAddress));
    const governances = await getGovernanceAccounts(connection, programId, Governance, [
        pubkeyFilter(1, new PublicKey(realmAddress) ),
    ]);
    const governance = governances.filter((gov)=>gov.pubkey.toString()===realmData.account.authority?.toString())[0];
    const proposals = await getGovernanceAccounts(connection, programId, Proposal, [
                pubkeyFilter(1, governance.pubkey),
    ]);

    return proposals;
}

export async function getRealmTransactionHashStatus(realmAddress: string, proposalPublicKey: string) {
    const allProposals = await initialiseAllProposals(realmAddress);

    const propsalsToSend = {};

    (allProposals
        ?.filter((proposal) => proposalPublicKey.includes(proposal.pubkey.toString())) || [])
        .map((proposal) => {
            let executionTimeStamp: Date
            if(proposal.account.state===5){
                const closedAt = new Date((Number(proposal?.account?.closedAt?.toString()||''))*1000);
                executionTimeStamp = closedAt;
            }
            
            propsalsToSend[proposal.pubkey.toString()] = {status:proposal.account.state < 5 ? 0 : proposal.account.state === 5 ? 1 : 2, executionTimeStamp}
        })
    return propsalsToSend;
}

export async function getTokenUSDonDate(tokenName: string, date: string) {
    if (!date) return 0
	let url = `https://api.coingecko.com/api/v3/coins/${tokenName}/history?date=${date}&localization=false`
	let tokenUsdValue = parseFloat((await axios.get(url)).data?.market_data?.current_price?.usd)
    if (!tokenUsdValue){
        url = `https://api.coingecko.com/api/v3/simple/price?ids=${tokenName}&vs_currencies=usd`
        tokenUsdValue = parseFloat((await axios.get(url)).data[tokenName].usd)
    }
    console.log(tokenUsdValue)
	return tokenUsdValue;
}



