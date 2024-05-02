import { Secret } from "jsonwebtoken";

export const SECRET_KEY: Secret = process.env.SECRET_KEY as string;
const DB_URL_LOCAL: string = "127.0.0.1:27017";
const DB_NAME: string = process.env.DB_NAME as string;
const PROD_DB_URL: string = process.env.DB_URL as string;
export const DB_URL: string =
  process.env.NODE_ENV == "dev"
    ? "mongodb://" + DB_URL_LOCAL + "/" + DB_NAME + "?retryWrites=true"
    : PROD_DB_URL + "/" + DB_NAME + "?retryWrites=true";

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);

export const RAZORPAY_KEY_ID: string = process.env.RAZORPAY_KEY_ID as string;
export const RAZORPAY_KEY_SECRET: string = process.env
  .RAZORPAY_KEY_SECRET as string;

export const STATIC_FILE_PATH: string =
  process.env.NODE_ENV == "dev"
    ? "http://localhost:4000/static/"
    : "https://weo.ai/static/";

export const STP_SECRET_KEY = process.env.STP_SECRET_KEY as string;
export const STP_PUBLISHABLE_KEY = process.env.STP_PUBLISHABLE_KEY as string;

import Stripe from "stripe";
export const stripe = new Stripe(STP_SECRET_KEY);
