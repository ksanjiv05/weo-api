import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { conn_v2 } from "../db";

export interface ICategory extends Document {
  uid: string;
  _id: string;
  parentCategoryId: string | null;
  name: string;
  quantities: string[];
  categoryPic: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updateAt?: Date;
}

const categorySchema: Schema = new Schema(
  {
    uid: String,
    parentCategoryId: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
    },
    categoryPic: {
      type: String,
      default: null,
    },
    quantities: [{ type: Schema.Types.ObjectId, ref: "Quantity" }],
    description: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: "text" });

categorySchema.post<ICategory>("save", function () {
  logging.info("Mongo", "Category just saved: ");
});

export default conn_v2.model<ICategory>("Category", categorySchema);
