// rzp.payments.refund('pay_6CnTwKKUY8iKCU').then((data) => {
//     // success
//   }).catch((error) => {
//     // error
//   })

import instance from "..";
import { RefundFromPayment } from "../../../types";

//   // Partial refund for a payment
//   rzp.payments.refund('pay_6CnVGA5eq4D7Ce', {
//     amount: 500,
//     notes: {
//       note1: 'This is a test refund',
//       note2: 'This is a test note'
//     }
//   }).then((data) => {
//     // success
//   }).catch((error) => {
//     console.error(error)
//     // error
//   })

export const createRefund = async ({
  paymentId,
  amount,
  notes,
}: RefundFromPayment) => {
  try {
    const response = await instance.payments.refund(paymentId, {
      amount,
      notes,
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};
