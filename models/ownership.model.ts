import { number } from "joi";
import { Schema } from "mongoose";
import { conn_v2 } from "../db";

// export IOwnership = {
//     owner: [
//         {
//           ownerId: req.user._id,
//           isCurrentOwner: true,
//         },
//       ],
//       transaction: newOLog._id,
//       offer_access_codes: [
//         {
//           code: newOfferCollected._id,
//           status: OFFER_COLLECTION_EVENTS.COLLECTED,
//         },
//       ],
//       isFullPayment,
//       offerExpiryDate: st,
//       quantity: number,
// }

export interface IOwnership {
  owner: [
    {
      ownerId: string;
      isCurrentOwner: boolean;
    }
  ];
  transactions: string[];
  offer_access_codes: [
    {
      code: string;
      status: string;
    }
  ];
  isFullPayment: boolean;
  deliveryCount: number;
  currentInstallment: number;
  totalInstallment: number;
  installmentDueDate: string;
  offerActivationDate: string;
  noOfInstallments: number;
  pendingInstallment: number;
  offerExpiryDate: string;
  oEarned: number;
  quantity: number;
}

const ownershipSchema: Schema = new Schema(
  {
    owner: [
      {
        ownerId: { type: Schema.Types.ObjectId, ref: "User" },
        isCurrentOwner: { type: Boolean, default: true },
      },
    ],
    transactions: [{ type: Schema.Types.ObjectId, ref: "OLog" }],
    offer_access_codes: [
      {
        code: { type: String },
        status: { type: Number },
      },
    ],
    isFullPayment: { type: Boolean, default: false },
    deliveryCount: { type: Number, default: 0 },
    currentInstallment: { type: Number, default: 0 },
    totalInstallment: { type: Number, default: 0 },
    installmentDueDate: { type: String },
    offerActivationDate: { type: String },
    noOfInstallments: { type: Number, default: 1 },
    pendingInstallment: { type: Number, default: 1 },
    offerExpiryDate: { type: String },
    oEarned: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    quantity: String,
  },
  {
    timestamps: true,
  }
);

const Ownership = conn_v2.model("Ownership", ownershipSchema);

export default Ownership;
