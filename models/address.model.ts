import mongoose, { Schema, Document } from "mongoose";
import logging from "../config/logging";
import { conn_v2 } from "../db";

export interface IAddress extends Document {
  user: any;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  landmark: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updateAt: Date;
}

const addressSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      // required: true,
    },
    state: {
      type: String,
      // required: true,
    },
    country: {
      type: String,
      required: true,
    },
    pinCode: {
      type: String,
      required: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], index: "2dsphere" }, // Latitude and Longitude
    },
  },
  { timestamps: true }
);

addressSchema.index({ location: "2dsphere" });

addressSchema.post<IAddress>("save", function () {
  logging.info("Mongo", "Address just saved: ");
});

addressSchema.pre<IAddress>("save", function (next) {
  const brand = this; // This refers to the document being saved
  const { user } = brand; // Extract user data

  // Assign user reference to brand
  brand.user = user._id;
  next();
});

export default conn_v2.model<IAddress>("Address", addressSchema);

// const mapItemSchema = new mongoose.Schema({
//   name: String,
//   location: {
//       // It's important to define type within type field, because
//       // mongoose use "type" to identify field's object type.
//       type: {type: String, default: 'Point'},
//       // Default value is needed. Mongoose pass an empty array to
//       // array type by default, but it will fail MongoDB's pre-save
//       // validation.
//       coordinates: {type: [Number], default: [0, 0]}
//   }
// });
// const MapItem = mongoose.model('MapItem', mapItemSchema);

// MapItem.create({
//   name: 'Toronto',
//   location: {
//       type: 'Point',
//       // Place longitude first, then latitude
//       coordinate: [-79.3968307, 43.6656976]
//   }
// });

//https://stackoverflow.com/questions/61343311/mongoose-geo-near-search-how-to-sort-within-a-given-distance

// Function to find addresses near a given point
// const findNearbyAddresses = async (longitude, latitude, maxDistance) => {
//   try {
//     const addresses = await Address.find({
//       location: {
//         $near: {
//           $geometry: {
//             type: "Point",
//             coordinates: [longitude, latitude]
//           },
//           $maxDistance: maxDistance // Distance in meters
//         }
//       }
//     });
//     return addresses;
//   } catch (error) {
//     console.error("Error finding nearby addresses:", error);
//     throw error;
//   }
// };

// // Example call: Find addresses within 5km of a given point
// findNearbyAddresses(34.052235, -118.243683, 5000);
