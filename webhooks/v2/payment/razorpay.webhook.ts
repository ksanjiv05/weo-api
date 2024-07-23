import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { RAZORPAY_WEBHOOK_SIGNATURE } from "../../../config/config";
import { PAYMENT_EVENTS } from "../../../constants";
import { IPayment } from "../../../interfaces/IPayment";
import Transaction from "../../../models/transaction.model";
import { ORDER_TYPE } from "../../../config/enums";
import { walletTopUp } from "../../../helper/user";

export const paymentWebhook = async (req: any, res: any) => {
  try {
    // console.log("purchaseOrderWebhook", JSON.stringify(req.body));
    const signature = req.headers["x-razorpay-signature"];
    // const eventId = req.headers["x-razorpay-event-id"]; // should be unique in per payment
    // console.log("eventId", eventId);
    const isValid = validateWebhookSignature(
      JSON.stringify(req.body),
      signature,
      RAZORPAY_WEBHOOK_SIGNATURE
    );

    if (isValid) {
      const { event, payload, account_id } = req.body;
      let status = false;
      switch (event) {
        case PAYMENT_EVENTS.AUTHORIZED:
          status = await handlePayment({
            payload,
            account_id,
            isPaymentSuccess: true,
          });
          break;
        case PAYMENT_EVENTS.CAPTURED:
          // await handleCapturedPayment(payload);
          break;
        case PAYMENT_EVENTS.FAILED:
          status = await handlePayment({
            payload,
            account_id,
            isPaymentSuccess: false,
          });
          break;
        default:
          // console.log(`Unhandled event: ${event}`);
          break;
      }
      if (status) {
        return res.status(200).send("payment log successfully created");
      } else {
        return res.status(400).send("payment log not created");
      }
    }
    console.log("__++__");
    res.status(400).send("payment log not created");
  } catch (error) {
    console.log(error);
    return res.status(400).send("payment log not created");
  }
};

async function handlePayment(paymentLogPayload: any) {
  try {
    const { account_id, payload, isPaymentSuccess = false } = paymentLogPayload;
    const {
      id,
      amount,
      currency,
      status,
      order_id,
      method,
      amount_refunded,
      refund_status,
      card_id,
      vpa,
      notes,
      fee,
      tax,
      acquirer_data,
      created_at,
      bank,
      wallet,
      email,
      contact,
      error_code,
      error_description,
      error_source,
      error_step,
      error_reason,
    }: IPayment = payload.payment.entity;
    const newTransaction = new Transaction({
      user: notes.user,
      transactionId: id,
      orderId: order_id,
      paymentId: id,
      transferId: "",
      transactionType: notes?.type,
      transactionMethod: {
        type: method,
        id: card_id || vpa,
      },
      transactionAmount: amount,
      currency,
      transactionStatus: status,
      transactionDate: created_at,
      transactionFrom: notes.user,
      transactionTo: account_id,
      acquirerData: acquirer_data,
      fee,
      tax,
      refundAmount: amount_refunded,
      refundStatus: refund_status,
      email,
      contact,
      error: {
        code: error_code,
        description: error_description,
        source: error_source,
        step: error_step,
        reason: error_reason,
      },
      bank,
      wallet,
    });
    await newTransaction.save();
    if (isPaymentSuccess && notes && notes.type === ORDER_TYPE.TOPUP) {
      walletTopUp({
        amount: amount,
        user: notes?.user,
      });
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

function handleCapturedPayment(payload: any) {
  throw new Error("Function not implemented.");
}

function handleFailedPayment(payload: any) {
  throw new Error("Function not implemented.");
}
