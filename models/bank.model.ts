// Objective : Define the Bank model and interface
// Author : Sanjiv Kumar Pandit ( ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import { conn_v2 } from "../db";

export interface IBank extends Document {
  user: any;
  accountNumber: string;
  isPrimary: boolean;
  accountHolderName: string;
  accountId: string;
  ifscCode?: string;
}

//define the Bank schema
const bankSchemaAccount: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    isPrimary: {
      type: Boolean,
      required: true,
    },
    accountHolderName: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
      required: true,
    },
    ifscCode: {
      type: String,
    },
  },
  { timestamps: true }
);

// set unique constraint on accountNumber
bankSchemaAccount.index({ accountNumber: 1, uid: 1 }, { unique: true });

bankSchemaAccount.pre<IBank>("save", function (next) {
  const brand = this; // This refers to the document being saved
  const { user } = brand; // Extract user data

  // Assign user reference to brand
  brand.user = user._id;
  next();
});

export default conn_v2.model<IBank>("Bank", bankSchemaAccount);
