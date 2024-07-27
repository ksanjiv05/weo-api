import mongoose from "mongoose";
import { conn_v2 } from "../db";

export interface IOLog {
  event: string;
  amount: number;
  discount: number;
  offer: string;
  brand: string;
  seller: string;
  buyer: string;

  quantity: number;
  oPriceRate: number; //1$ against 100

  oAgainstPrice: number;
  oGenerated: number;
  atPlatformCutOffRate: number;
  atRateCutOffFromDiscount: number;
  toPlatformCutOffRateFromDiscount: number;
  toPlatformCutOffRate: number;
  createdAt: Date;
}

const oLogSchema = new mongoose.Schema(
  {
    event: {
      type: String,
      required: true,
    },
    amount: Number,
    discount: Number,
    offer: { type: mongoose.Types.ObjectId, ref: "Offer" },
    brand: { type: mongoose.Types.ObjectId, ref: "Brand" },
    seller: {
      id: { type: mongoose.Types.ObjectId, ref: "User" },
      oQuantity: Number,
    },
    buyer: {
      id: { type: mongoose.Types.ObjectId, ref: "User" },
      oQuantity: Number,
    },
    quantity: Number,
    oPriceRate: Number,
    oAgainstPrice: Number,
    oGenerated: Number,
    atPlatformCutOffRate: Number,
    atRateCutOffFromDiscount: Number,
    toPlatformCutOffRateFromDiscount: Number,
    toPlatformCutOffRate: Number,
  },
  {
    timestamps: true,
  }
);

//TODO : add index for unique
// oLogSchema.index({ event: 1 }, { unique: true });

export default conn_v2.model<IOLog>("OLog", oLogSchema);
