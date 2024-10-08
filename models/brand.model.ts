// Objective : Define the Brand model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";
import { STATUS } from "../config/enums";

export interface IBrand extends Document {
  user: any;
  brandName: string;
  brandDescription: string;
  brandLogo?: string;
  categoryId: string;
  status: number; // 0: PENDING, 1: LIVE, 2: ONHOLD
  checkpoint: number;
  isDeleted?: boolean;
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
      // required: true,
      default: "n/a",
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: Number,
      // enum: [0, 1, 2], // 0: PENDING, 1: LIVE, 2: ON_HOLD
      required: true,
      default: STATUS.PENDING,
    },
    checkpoint: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// set unique constraint on brandName
brandSchema.index({ brandName: 1, user: 1 }, { unique: true });

//set search index on brandName
brandSchema.index({ brandName: "text", brandDescription: "text" });

// pre-save hook to assign user reference  to brand

brandSchema.pre<IBrand>("save", function (next) {
  const brand = this; // This refers to the document being saved
  const { user } = brand; // Extract user data

  // Assign user reference to brand
  brand.user = user._id;
  next();
});

// brandSchema.pre("remove", function (next) {

// })

// export the Brand model
export default conn_v2.model<IBrand>("Brand", brandSchema);
