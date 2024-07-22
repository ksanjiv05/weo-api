import mongoose from "mongoose";

export interface IOLog {
  event: string;
  amount: number;
  discount: number;
  offerId: string;
  seller: string;
  buyer: string;
  offerPrice: number;
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
      lowercase: true,
    },
    amount: Number,
    discount: Number,
    offerId: { type: mongoose.Types.ObjectId, ref: "Offer" },
    seller: { type: mongoose.Types.ObjectId, ref: "User" },
    buyer: { type: mongoose.Types.ObjectId, ref: "User" },
    offerPrice: Number,
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

export default mongoose.model<IOLog>("OLog", oLogSchema);
