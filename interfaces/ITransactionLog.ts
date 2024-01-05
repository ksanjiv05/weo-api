// {
//   "entity": "event",
//   "account_id": "acc_BFQ7uQEaa7j2z7",
//   "event": "payment.captured",
//   "contains": [
//     "payment"
//   ],
//   "payload": {
//     "payment": {
//       "entity": {
//         "id": "pay_DESlfW9H8K9uqM",
//         "entity": "payment",
//         "amount": 100,
//         "currency": "INR",
//         "base_amount": 100,
//         "status": "captured",
//         "order_id": "order_DESlLckIVRkHWj",
//         "invoice_id": null,
//         "international": false,
//         "method": "netbanking",
//         "amount_refunded": 0,
//         "amount_transferred": 0,
//         "refund_status": null,
//         "captured": true,
//         "description": null,
//         "card_id": null,
//         "bank": "HDFC",
//         "wallet": null,
//         "vpa": null,
//         "email": "gaurav.kumar@example.com",
//         "contact": "+919876543210",
//         "notes": [],
//         "fee": 2,
//         "tax": 0,
//         "error_code": null,
//         "error_description": null,
//         "error_source": null,
//         "error_step": null,
//         "error_reason": null,
//         "acquirer_data": {
//           "bank_transaction_id": "0125836177"
//         },
//         "created_at": 1567674599
//       }
//     }
//   },
//   "created_at": 1567674606
// }

import { Document } from "mongoose";

export interface ITransactionLog extends Document {
  uid: string;
  offerId: string;
  offerName?: string;
  brandName?: string;
  offerImg?: string;

  creatorId: string;

  orderId: string | null;
  accountId: string | null;
  paymentId: string | null;
  refundId: string | null;
  transferId: string | null;

  oEarned: number;
  oSpent: number;

  tax: number;
  fee: number;

  transactionType: string;
  transactionStatus: string;
  transactionAmount: number;
  transactionCurrency: string;
  transactionDate: number;
  transactionTime: number;
  transactionDescription: string;
  paymentMethod: string;
  transactionModeDetails: string;
}
