import dotenv from "dotenv";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { updateTransactionStatus } from "../utils";
import { SupportedChainId } from "../utils/types";

dotenv.config();

const rpcUrl = process.env.GOERLI_RPC_URL;

export const goerliTrxnStatus = async (
    event: APIGatewayProxyEvent,
    context: Context,
  ) => {
      await updateTransactionStatus(SupportedChainId.GOERLI_TESTNET, rpcUrl);
  };
