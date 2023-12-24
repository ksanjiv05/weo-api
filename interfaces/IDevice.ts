import { Document } from "mongoose";

export interface IDevice extends Document {
  deviceId: string;
  deviceName: string;
  deviceOS: string;
  appVersion: string;
}
