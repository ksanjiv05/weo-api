import mongoose, { Document, Schema } from "mongoose";
import { conn_v2 } from "../db";
import { generateHash } from "../helper/utils";
interface IWallet extends Document {
  uid: string;
  name: string;
  balance: number;
  currency: string;
  verifyString: string;
}

const walletSchema = new Schema(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    balance: { type: Number, required: true },
    currency: { type: String, required: true },
    verifyString: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

walletSchema.index({ user: 1 }, { unique: true });

walletSchema.pre("save", function (next) {
  const wallet = this;
  const toBeVerifyString =
    wallet.balance.toString() + "-" + wallet.user.toString();
  wallet.verifyString = generateHash(toBeVerifyString);
  next();
});

export default conn_v2.model<IWallet>("Wallet", walletSchema);
