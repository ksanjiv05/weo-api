import mongoose, { Schema } from "mongoose";
import logging from "../config/logging";
import { ICategory } from "../interfaces/ICategory";
import { boolean } from "joi";

// const CategorySchema: Schema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       lowercase: true,
//       unique: true,
//     },
//     categories: {
//       type: [String],
//       default: [],
//       lowercase: true,
//     },
//     categoryPic: {
//       type: String,
//     },
//     activeCategoryPic: {
//       type: String,
//     },
//     isActive: { type: Boolean, default: false },
//     description: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

const CategorySchema: Schema = new Schema(
  {
    subCategoryId: {
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
    activeCategoryPic: {
      type: String,
      default: null,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

CategorySchema.index({ name: "text" });

CategorySchema.post<ICategory>("save", function () {
  logging.info("Mongo", "Category just saved: ");
});

export default mongoose.model<ICategory>("Category", CategorySchema);
