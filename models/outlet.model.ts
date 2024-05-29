// Objective : Define the Outlet model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";
import Address from "../models_v1/Address";
import { conn_v2 } from "../db";

export interface IOutlet extends Document {
  user: any;
  outletName: string;
  address: any;
  //   outletLocation: string;
  //   outletAddress: string;
  //   outletPincode: number;
  //   outletLandmark?: string;
  //   latitude: number;
  //   longitude: number;
  operatingDays?: [{ day: string; startTiming: string; endTiming: string }];
  serviceTools?: string[];
  serviceContacts?: [
    {
      email: { emailId: string; visibility: boolean };
      phone: { number: string; visibility: boolean };
    }
  ];
}

// define the Outlet schema

const outletSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // brand: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Brand",
    //   required: true,
    // },
    outletName: {
      type: String,
      required: true,
    },
    // address: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Address",
    //   required: true,
    // },
    address: {
      outletAddress: {
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
    operatingDays: [
      {
        day: {
          type: String,
          required: true,
        },
        startTiming: {
          type: String,
          required: true,
        },
        endTiming: {
          type: String,
          required: true,
        },
      },
    ],
    serviceTools: [
      { type: mongoose.Schema.Types.ObjectId, ref: "ServiceTool" },
    ],
    serviceContacts: [
      {
        email: {
          emailId: {
            type: String,
            required: true,
          },
          visibility: {
            type: Boolean,
            required: true,
          },
        },
        phone: {
          number: {
            type: String,
            required: true,
          },
          visibility: {
            type: Boolean,
            required: true,
          },
        },
      },
    ],
  },
  { timestamps: true }
);

// set unique constraint on outletName
outletSchema.index({ user: 1, brand: 1, outletName: 1 }, { unique: true });

// pre-save hook to create a new Address document and update user reference
outletSchema.pre("save", async function (next) {
  const outlet = this; // This refers to the outlet document being saved
  const { address, user } = outlet; // Extract address data

  const newAddress = new Address(address);
  await newAddress.save();

  outlet.user = user._id;
  outlet.address = newAddress._id; // Update outlet reference with new address ID
  next(); // Proceed with saving the outlet document
});

export default conn_v2.model<IOutlet>("Outlet", outletSchema);

// User's current location (example coordinates)
// const userLocation = {
//   type: "Point",
//   coordinates: [-73.856077, 40.848447], // longitude, latitude
// };

// // Aggregation pipeline
// Brand.aggregate([
//   {
//     $unwind: "$outlets", // Decompose the outlets array
//   },
//   {
//     $match: {
//       "outlets.address.location": {
//         $nearSphere: {
//           $geometry: userLocation,
//           $maxDistance: 10000, // distance in meters, 10 km
//         },
//       },
//     },
//   },
//   {
//     $group: {
//       _id: "$_id", // Group back by brand ID
//       brandName: { $first: "$brandName" }, // Retain the brand name
//       outlets: { $push: "$outlets" }, // Aggregate the filtered outlets
//     },
//   },
// ])
//   .then((brands) => {
//     console.log(brands); // Output the brands and their nearby outlets
//   })
//   .catch((err) => {
//     console.error(err); // Handle possible errors
//   });
