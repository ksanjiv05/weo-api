import mongoose from "mongoose";

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

export default mongoose.model("Device", DeviceSchema);
