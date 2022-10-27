import dotenv from "dotenv";
import cron from 'node-cron';
import goerliTrxnStatus from "./chains/goerli-testnet.js";
import optimismTrxnStatus from "./chains/optimisim-mainnet.js";
import celoTrxnStatus from "./chains/celo-mainnet.js";
import polygonTrxnStatus from "./chains/polygon-mainnet.js";
 
dotenv.config();

cron.schedule('*/15 * * * *', () => {
    goerliTrxnStatus()
});
cron.schedule('*/15 * * * *', () => {
    optimismTrxnStatus()
});
cron.schedule('*/15 * * * *', () => {
    celoTrxnStatus()
});
cron.schedule('*/15 * * * *', () => {
    polygonTrxnStatus()
});
//example for running the script every 15 mins using cron
//cron.schedule('*/15 * * * *', () => {
//     goerliTrxnStatus()
// });