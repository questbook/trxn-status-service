import dotenv from "dotenv";
import goerliTrxnStatus from "./chains/goerli-testnet.js";
import optimismTrxnStatus from "./chains/optimisim-mainnet.js";
import celoTrxnStatus from "./chains/celo-mainnet.js";
 
dotenv.config();

goerliTrxnStatus()
// optimismTrxnStatus()
// celoTrxnStatus()