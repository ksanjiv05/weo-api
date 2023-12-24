// // payment.authorized, payment.captured, payment.failed, payment.dispute.created, refund.failed, refund.created

import { ITransactionLog } from "../../../interfaces/ITransactionLog";

// {
//     "entity": "event",
//     "account_id": "acc_BFQ7uQEaa7j2z7",
//     "event": "payment.authorized",
//     "contains": [
//       "payment"
//     ],
//     "payload": {
//       "payment": {
//         "entity": {
//           "id": "pay_DESlfW9H8K9uqM",
//           "entity": "payment",
//           "amount": 100,
//           "currency": "INR",
//           "status": "authorized",
//           "order_id": "order_DESlLckIVRkHWj",
//           "invoice_id": null,
//           "international": false,
//           "method": "netbanking",
//           "amount_refunded": 0,
//           "refund_status": null,
//           "captured": false,
//           "description": null,
//           "card_id": null,
//           "bank": "HDFC",
//           "wallet": null,
//           "vpa": null,
//           "email": "gaurav.kumar@example.com",
//           "contact": "+919876543210",
//           "notes": [],
//           "fee": null,
//           "tax": null,
//           "error_code": null,
//           "error_description": null,
//           "error_source": null,
//           "error_step": null,
//           "error_reason": null,
//           "acquirer_data": {
//             "bank_transaction_id": "0125836177"
//           },
//           "created_at": 1567674599
//         }
//       }
//     },
//     "created_at": 1567674606
//   }

//for payment and refund
const traceEvent = (event: string) => {
  switch (event) {
    case "payment_authorized":
      break;
    case "payment_captured":
      break;
    case "payment_failed":
      break;
    case "refund_failed":
      break;
    case "refund.created":
      break;
  }
};

// uid: string;
// offerId: string;
// creatorId: string;

// orderId: string | null;
// accountId: string | null;
// paymentId: string | null;
// refundId: string | null;
// transferId: string | null;

// transactionType: string;
// transactionStatus: string;
// transactionAmount: number;
// transactionCurrency: string;
// transactionDate: number;
// transactionTime: number;
// transactionDescription: string;
// transactionMode: string;
// transactionModeDetails: strin

const paymentAuthorizedTrans = (
  //   uid: string,
  //   creatorId: string,
  //   offerId: string,
  account_id: string,
  paymentEventObj: any
) => {
  try {
    const {
      id,
      entity,
      amount,
      currency,
      status,
      order_id,
      invoice_id,
      international,
      method,
      amount_refunded,
      refund_status,
      captured,
      description,
      card_id,
      bank,
      wallet,
      vpa,
      email,
      contact,
      notes,
      fee,
      tax,
      created_at,
    } = paymentEventObj.payload.payment.entity;
    const [offerId, creatorId, uid, tid] = notes["offerId"].split("_");
    const transactionLog: any = {
      uid,
      offerId,
      creatorId,
      orderId: order_id,
      accountId: account_id,
      paymentId: id,
      refundId: "",
      transferId: tid,
      transactionType: "payment",
      fee,
      tax,
      transactionStatus: status,
      transactionAmount: amount,
      transactionCurrency: currency,
      transactionDate: created_at,
      transactionTime: created_at,
      transactionDescription: description,
      paymentMethod: method,
      transactionModeDetails: JSON.stringify({
        card_id,
        bank,
        wallet,
        vpa,
      }),
    };
  } catch (err) {
    console.log(err);
  }
};

const paymentCapturedTrans = () => {};

const paymentFailedTrans = () => {};

const refundFailedTrans = () => {};

const refundCreatedTrans = () => {};
