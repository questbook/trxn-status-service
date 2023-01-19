import dotenv from "dotenv";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { updateTransactionStatus } from "../utils";
import { SupportedChainId } from "../utils/types";

dotenv.config();

const rpcUrl = process.env.OPTIMISM_RPC_URL;

export const optimismTrxnStatus = async (
    event: APIGatewayProxyEvent,
    context: Context,
  ) => {
      await updateTransactionStatus(SupportedChainId.OPTIMISM_MAINNET, rpcUrl);
  };
