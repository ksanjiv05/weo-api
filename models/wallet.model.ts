import mongoose, { Document, Schema } from "mongoose";
import { conn_v2 } from "../db";
import { generateHash } from "../helper/utils";
import logging from "../config/logging";
export interface IWallet extends Document {
  user: string;
  name: string;
  balance: number;
  oBalance: number;
  currency: string;
  oRate: number;
  verifyString?: string;
}

const walletSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    name: { type: String, required: true },
    balance: { type: Number, required: true },
    currency: { type: String, required: true },
    oBalance: { type: Number, default: 0 },
    oRate: { type: Number, default: 100 },
    verifyString: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// walletSchema.index({ user: 1 }, { unique: true });

// walletSchema.pre<IWallet>("save", function (next) {
//   logging.info("walletSchema.pre", "", this);
//   const wallet = this;
//   const toBeVerifyString =
//     wallet.balance.toString() + "-" + wallet.name.toString();
//   wallet.verifyString = generateHash(toBeVerifyString);
//   logging.info("toBeVerifyString", "", wallet);
//   next();
// });

// walletSchema.post<IWallet>("save", function () {
//   logging.info("Mongo", "Wallet just saved: ");
// });

export default conn_v2.model<IWallet>("Wallet", walletSchema);
