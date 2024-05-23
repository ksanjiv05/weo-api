// Objective : Define the listed model and interface
// Author : Sanjiv Kumar Pandit

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IListed extends Document {
  orderID: string;
  owner: any; // user reference
  offer_access_codes: [
    {
      code: string; // access code combination of offer id and sum number
      transaction: any; // transaction reference
      status: string;
    }
  ];
}
