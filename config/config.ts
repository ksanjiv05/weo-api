import { Secret } from "jsonwebtoken";
import OpenAI from "openai";

export const SECRET_KEY: Secret = process.env.SECRET_KEY as string;
const DB_URL_LOCAL: string = "127.0.0.1:27017";
export const DB_NAME: string = process.env.DB_NAME as string;

const PROD_DB_URL: string = process.env.DB_URL as string;
export const DB_URL: string =
  process.env.NODE_ENV == "dev"
    ? "mongodb://" + DB_URL_LOCAL + "/"
    : PROD_DB_URL + "/";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const RAZORPAY_KEY_ID: string = process.env.RAZORPAY_KEY_ID as string;
export const RAZORPAY_KEY_SECRET: string = process.env
  .RAZORPAY_KEY_SECRET as string;
export const RAZORPAY_WEBHOOK_SIGNATURE = process.env
  .RAZORPAY_WEBHOOK_SIGNATURE as string;

export const STATIC_FILE_PATH: string =
  process.env.NODE_ENV == "dev"
    ? "http://localhost:4000/static/"
    : "https://weo.ai/static/";

export const STP_SECRET_KEY = process.env.STP_SECRET_KEY as string;
export const STP_PUBLISHABLE_KEY = process.env.STP_PUBLISHABLE_KEY as string;
export const STP_ENDPOINT_SECRET = process.env.STP_ENDPOINT_SECRET as string;

import Stripe from "stripe";
export const stripe = new Stripe(STP_SECRET_KEY);

export const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY as string;
export const accessKeyId = process.env.AWS_ACCESS_KEY_ID as string;
export const region = process.env.REGION as string;
export const bucketName = process.env.BUCKET_NAME as string;

export const exchangeRateApiKey = process.env.EXCHANGE_API_KEY as string;

export const hashSecretKey = process.env.HASH_SECRET_KEY as string;

export const BASE_CURRENCY = "USD";

export const oNetworkConfig = {
  price: 1,
  oAgainstPrice: 100,
  ratio: 1 / 100,
  volume: 10000,
  oReservedVolume: 10000,

  atPlatformCutOffRate: 10,
  atRateCutOffFromDiscount: 100,
  toPlatformCutOffRateFromDiscount: 0,
  toPlatformCutOffRate: 10,
};

export const negotiationConfig = {
  maxAttempts: 2,
  oCharge: 10,
  freeAttempts: 1,
};

export const oNetworkConfigLoad = async () => {};
