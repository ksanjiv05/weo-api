import mongoose from "mongoose";
import { conn_v2 } from "../db";

type EventProp = {
  event: number;
  oQuantity: number;
  id: any;
};
export interface IOLog {
  amount: number;
  discount: number;
  offer: any;
  brand: any;
  outlet: any;
  seller: EventProp;
  buyer: EventProp;

  quantity: number;
  oPriceRate: number; //1$ against 100

  oAgainstPrice: number;
  oGenerated: number;
  atPlatformCutOffRate: number;
  atRateCutOffFromDiscount: number;
  toPlatformCutOffRateFromDiscount: number;
  toPlatformCutOffRate: number;
  createdAt: Date;
  transaction: any;
}

const oLogSchema = new mongoose.Schema(
  {
    amount: Number,
    discount: Number,
    offer: { type: mongoose.Types.ObjectId, ref: "Offer" },
    brand: { type: mongoose.Types.ObjectId, ref: "Brand" },
    outlet: { type: mongoose.Types.ObjectId, ref: "Outlet" },
    seller: {
      id: { type: mongoose.Types.ObjectId, ref: "User" },
      oQuantity: Number,
      event: {
        type: Number,
        // required: true,
      },
    },
    buyer: {
      id: { type: mongoose.Types.ObjectId, ref: "User" },
      oQuantity: Number,
      event: {
        type: Number,
        // required: true,
      },
    },
    quantity: Number,
    oPriceRate: Number,
    oAgainstPrice: Number,
    oGenerated: Number,
    atPlatformCutOffRate: Number,
    atRateCutOffFromDiscount: Number,
    toPlatformCutOffRateFromDiscount: Number,
    toPlatformCutOffRate: Number,
    transaction: { type: mongoose.Types.ObjectId, ref: "Transaction" },
  },
  {
    timestamps: true,
  }
);

//TODO : add index for unique
// oLogSchema.index({ event: 1 }, { unique: true });

export default conn_v2.model<IOLog>("OLog", oLogSchema);
