import dotenv from "dotenv";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { SupportedChainId } from "../utils/types";
import { updateTransactionStatus } from "../utils";

dotenv.config();

const rpcUrl = process.env.POLYGON_RPC_URL;

export const polygonTrxnStatus = async (
    event: APIGatewayProxyEvent,
    context: Context,
  ) => {
      await updateTransactionStatus(SupportedChainId.POLYGON_MAINNET, rpcUrl);
  };
