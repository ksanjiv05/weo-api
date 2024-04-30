// Objective : Define the Brand model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";

export interface IBrand extends Document {
  user: any;
  brandName: string;
  brandDescription: string;
  brandLogo: string;
  categoryId: number;
  status: number;
  checkpoint: number;
}

// define the Brand schema
const brandSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    brandName: {
      type: String,
      required: true,
    },
    brandDescription: {
      type: String,
      required: true,
    },
    brandLogo: {
      type: String,
      required: true,
    },
    categoryId: {
      // category id
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1, 2], // 0: PENDING, 1: LIVE, 2: ONHOLD
      required: true,
    },
    checkpoint: {
      type: Number,
      required: true,
    },
    outlets: [
      {
        type: Schema.Types.ObjectId,
        ref: "Outlets",
      },
    ],
  },
  { timestamps: true }
);

// set unique constraint on brandName
brandSchema.index({ brandName: 1, user: 1 }, { unique: true });

//set search index on brandName
brandSchema.index({ brandName: "text" });

// export the Brand model
export default mongoose.model<IBrand>("Brand", brandSchema);
