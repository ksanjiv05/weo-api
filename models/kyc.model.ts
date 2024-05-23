//Objective: Define the KYC model and interface
//Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IKYC extends Document {
  uid: string;
  panCardImage: string;
  govtIdFrontImage: string;
  govtIdBackImage: string;
  passportImage: string;
  drivingLicenseImage: string;
}

//define the KYC schema
const KYCSchema: Schema = new Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
    },
    panCardImage: {
      type: String,
      required: true,
    },
    govtIdFrontImage: {
      type: String,
      required: true,
    },
    govtIdBackImage: {
      type: String,
      required: true,
    },
    passportImage: {
      type: String,
      required: true,
    },
    drivingLicenseImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default conn_v2.model<IKYC>("KYC", KYCSchema);
