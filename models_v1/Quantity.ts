import mongoose from "mongoose";
import { conn_v1 } from "../db";

const quantitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    }, //name of usee who quantity
  },
  { timestamps: true }
);

// quantitySchema.index({ uid: 1, id: 1 }, { unique: true });

export default conn_v1.model("quantity", quantitySchema);
