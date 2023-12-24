import { Document } from "mongoose";

type paymentTransactionProps = {
  paymentId: string;
  paymentStatus: string;
  paymentAmount: number;
  paymentDate: number;
  paymentMethod: string;
};

type PaymentProps = {
  paymentAmount: number;
  paymentDate: number;
  paymentStatus: string;
  paymentDueDate?: number;
};

export interface ICollector extends Document {
  uid: string;
  oid: string;
  brandName: string;
  offerName: string;
  offerPic: string;
  offerDescription: string;
  offerPrice: number;
  lastPaid: PaymentProps;
  paymentDueDate: PaymentProps;
  oEarned: number;
  oSpent: number;
  paymentDue: number;
  installments: number; //default 1 for one time payment
  paymentProps: paymentTransactionProps[];
  isPaid: boolean;

  createdAt: number;
  updateAt: number;
}
