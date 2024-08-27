import mongoose from "mongoose";
import { conn_v2 } from "../db";

export interface IOConfig {
  currency: string;
  oAgainstPrice: number;
  oNetworkValue: number;
  networkRate: number;
  volume: number;
  oReservedVolume: number;
  atPlatformCutOffRate: number;
  atRateCutOffFromDiscount: number;
  toPlatformCutOffRateFromDiscount: number;
  toPlatformCutOffRate: number;
}

export const oConfigSchema = new mongoose.Schema<IOConfig>({
  currency: String,
  oAgainstPrice: Number,
  oNetworkValue: Number,
  networkRate: {
    type: Number,
    default: 1,
  },
  volume: Number,
  oReservedVolume: Number,
  atPlatformCutOffRate: Number,
  atRateCutOffFromDiscount: Number,
  toPlatformCutOffRateFromDiscount: Number,
  toPlatformCutOffRate: Number,
});

export const OConfig = conn_v2.model<IOConfig>("OConfig", oConfigSchema);
