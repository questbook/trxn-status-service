import dotenv from "dotenv";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { updateTransactionStatus } from "../utils";
import { SupportedChainId } from "../utils/types";

dotenv.config();

const rpcUrl = process.env.CELO_RPC_URL;

export const celoTrxnStatus = async (
    event: APIGatewayProxyEvent,
    context: Context,
  ) => {
      await updateTransactionStatus(SupportedChainId.CELO_MAINNET, rpcUrl, "cusd");
  };
