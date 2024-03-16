import mongoose, { Schema } from "mongoose";
import { ICategoryV2 } from "../interfaces/ICategory";
import logging from "../config/logging";

const CategorySchemaV2: Schema = new Schema(
  {
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

CategorySchemaV2.index({ name: "text" });

CategorySchemaV2.post<ICategoryV2>("save", function () {
  logging.info("Mongo", "Category just saved: ");
});

export default mongoose.model<ICategoryV2>("CategoryV2", CategorySchemaV2);
