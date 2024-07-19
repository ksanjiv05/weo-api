import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { RAZORPAY_WEBHOOK_SIGNATURE } from "../../../config/config";
import { PAYMENT_EVENTS } from "../../../constants";

export const paymentWebhook = async (req: any, res: any) => {
  console.log("purchaseOrderWebhook", req.body);
  const signature = req.headers["x-razorpay-signature"];
  const eventId = req.headers["x-razorpay-event-id"]; // should be unique in per payment
  const isValid = validateWebhookSignature(
    JSON.stringify(req.body),
    signature,
    RAZORPAY_WEBHOOK_SIGNATURE
  );

  if (isValid) {
    const { event, payload } = req.body;

    switch (event) {
      case PAYMENT_EVENTS.AUTHORIZED:
        await handleAuthorizedPayment(payload);
        break;
      case PAYMENT_EVENTS.CAPTURED:
        await handleCapturedPayment(payload);
        break;
      case PAYMENT_EVENTS.FAILED:
        await handleFailedPayment(payload);
        break;
      default:
        // console.log(`Unhandled event: ${event}`);
        break;
    }
  }
  res.status(200).send();
  res.send("purchaseOrderWebhook");
};

function handleAuthorizedPayment(payload: any) {
  throw new Error("Function not implemented.");
}

function handleCapturedPayment(payload: any) {
  throw new Error("Function not implemented.");
}

function handleFailedPayment(payload: any) {
  throw new Error("Function not implemented.");
}
