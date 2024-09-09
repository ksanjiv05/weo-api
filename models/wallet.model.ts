import mongoose, { Document, Query, Schema } from "mongoose";
import { conn_v2 } from "../db";
import { generateHash, generateHashWithKey } from "../helper/utils";
import logging from "../config/logging";
import { hashSecretKey } from "../config/config";
export interface IWallet extends Document {
  user: string;
  name: string;
  balance: number;
  oBalance: number;
  currency: string;
  oRate: number;
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
    hash: { type: String },
  },
  {
    timestamps: true,
  }
);

walletSchema.pre("save", function (next) {
  const document = this;
  // Concatenate the fields you want to hash
  const dataToHash = `${document.user}:${document.balance}:${document.oBalance}:${document.currency}`;

  console.log("dataToHash ", this.hash, dataToHash);
  // Generate and update the hash field
  document.hash = generateHashWithKey(hashSecretKey, dataToHash);

  next();
});

// walletSchema.pre<Query<IWallet, IWallet>>("updateOne", async function (next) {
//   const query = this;
//   const docToUpdate = await query.model.findOne(query.getQuery());

//   if (!docToUpdate) {
//     return next(new Error("Document not found"));
//   }

//   // Concatenate the fields used to generate the hash
//   const dataToHash = `${docToUpdate.user}:${docToUpdate.balance}:${docToUpdate.oBalance}:${docToUpdate.currency}`;

//   // Recompute the hash using the secret key
//   const recomputedHash = generateHashWithKey(hashSecretKey, dataToHash);

//   // Verify if the document's data is authentic by comparing the hash
//   if (recomputedHash !== docToUpdate.hash) {
//     return next(new Error("Data authenticity verification failed"));
//   }

//   // Get the update data
//   const update = query.getUpdate() as Partial<IWallet>;
//   const updatedBalance = update["$inc"].balance || docToUpdate.balance;
//   const updateOBalance = update["$inc"].oBalance || docToUpdate.oBalance;
//   const updatedCurrency = update.currency || docToUpdate.currency;

//   console.log(
//     "Data authenticity verification failed",
//     recomputedHash,
//     updatedBalance,
//     update.balance,
//     docToUpdate,
//     update
//   );
//   // Concatenate updated fields for the new hash
//   const updatedDataToHash = `${docToUpdate.user}:${updatedBalance}:${updateOBalance}:${updatedCurrency}`;

//   // Recompute the hash with updated values
//   update.hash = generateHashWithKey(updatedDataToHash, hashSecretKey);

//   next();
// });

export default conn_v2.model<IWallet>("Wallet", walletSchema);
