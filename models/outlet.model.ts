// Objective : Define the Outlet model and interface
// Author : Sanjiv Kumar Pandit (ksanjiv0005@gmail.com)

import mongoose, { Schema, Document } from "mongoose";

export interface IOutlet extends Document {
  user: any;
  brand: any;
  outletName: string;
  address: any;
  //   outletLocation: string;
  //   outletAddress: string;
  //   outletPincode: number;
  //   outletLandmark?: string;
  //   latitude: number;
  //   longitude: number;
  operatingDays?: [{ day: string; startTiming: string; endTiming: string }];
  serviceTools?: [{ service: string; oCharges: number }];
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
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    outletName: {
      type: String,
      required: true,
    },
    address: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    // outletLocation: {
    //   type: String,
    //   required: true,
    // },
    // outletAddress: {
    //   type: String,
    //   required: true,
    // },
    // outletPincode: {
    //   type: Number,
    //   required: true,
    // },
    // outletLandmark: {
    //   type: String,
    // },
    // latitude: {
    //   type: Number,
    //   required: true,
    // },
    // longitude: {
    //   type: Number,
    //   required: true,
    // },
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
      {
        service: {
          type: String,
          required: true,
        },
        oCharges: {
          type: Number,
          required: true,
        },
      },
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

export default mongoose.model<IOutlet>("Outlet", outletSchema);
