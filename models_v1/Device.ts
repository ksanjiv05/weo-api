import mongoose from "mongoose";
import { conn_v1 } from "../db";

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
    },
    deviceName: {
      type: String,
      lowercase: true,
      required: true,
    },
    deviceOS: {
      type: String,
      lowercase: true,
    }, //name of usee who Device
    appVersion: {
      type: String,
      lowercase: true,
    },
  },
  { timestamps: true }
);

DeviceSchema.index({ deviceName: 1, deviceId: 1 }, { unique: true });

export default conn_v1.model("Device", DeviceSchema);
