import mongoose from "mongoose";
import { conn_v1 } from "../db";

const LikedSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
    },
    likedBy: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }, //name of usee who liked
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      required: true,
    }, //id of the product or brand etc
  },
  { timestamps: true }
);

LikedSchema.index({ uid: 1, id: 1 }, { unique: true });

export default conn_v1.model("Liked", LikedSchema);
