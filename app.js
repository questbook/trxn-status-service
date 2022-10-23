import dotenv from "dotenv";
import goerliTrxnStatus from "./chains/goerli-testnet.js";
import optimismTrxnStatus from "./chains/optimisim-mainnet.js";
import celoTrxnStatus from "./chains/celo-mainnet.js";
 
dotenv.config();

goerliTrxnStatus()
// optimismTrxnStatus()
// celoTrxnStatus()

//example for running the script every 15 mins using cron
//cron.schedule('*/15 * * * *', () => {
//     goerliTrxnStatus()
// });