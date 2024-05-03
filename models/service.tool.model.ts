// Objective : Define the Service Tool model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IServiceTool extends Document {
  service: string;
  oCharges: number;
}

// define the Service Tool schema

const serviceToolSchema: Schema = new Schema(
  {
    service: {
      type: String,
      required: true,
    },
    oCharges: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

// set unique constraint on service
serviceToolSchema.index({ service: 1 }, { unique: true });

export default conn_v2.model<IServiceTool>("ServiceTool", serviceToolSchema);
