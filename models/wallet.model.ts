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
  hash?: string;
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
    hash: { type: String },
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

// walletSchema.pre("save", function (next) {
//   const document = this;
//   // Concatenate the fields you want to hash
//   const dataToHash = `${document.user}:${document.balance}:${document.oBalance}:${document.currency}`;

//   // Generate and update the hash field
//   document.hash = generateHash(dataToHash);

//   next();
// });

// // Middleware to recompute the hash when using findOneAndUpdate
// walletSchema.pre<IWallet>("updateOne", function (next) {
//   const update = this.getUpdate();

//   // Get the new values being updated
//   const user = update.user || this._update.user;
//   const balance = update.balance || this._update.balance;
//   const oBalance = update.oBalance || this._update.oBalance;
//   const currency = update.currency || this._update.currency;

//   // Concatenate the updated fields
//   const dataToHash = `${document.user}:${document.balance}:${document.oBalance}:${document.currency}`;

//   // Compute and set the new hash
//   this._update.hash = generateHash(dataToHash);

//   next();
// });

export default conn_v2.model<IWallet>("Wallet", walletSchema);
