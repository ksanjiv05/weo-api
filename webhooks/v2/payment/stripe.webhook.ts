import { STP_ENDPOINT_SECRET, stripe } from "../../../config/config";
import { ORDER_TYPE } from "../../../config/enums";
import { walletTopUp } from "../../../helper/user";
import transactionModel from "../../../models/transaction.model";

export const paymentWebhook = async (req: any, res: any) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // console.log("purchaseOrderWebhook", req.body, STP_ENDPOINT_SECRET);
    event = stripe.webhooks.constructEvent(req.body, sig, STP_ENDPOINT_SECRET);
    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
        const paymentIntentAmountCapturableUpdated = event.data.object;
        // Then define and call a function to handle the event payment_intent.amount_capturable_updated
        break;
      case "payment_intent.canceled":
        const paymentIntentCanceled = event.data.object;
        // Then define and call a function to handle the event payment_intent.canceled
        break;
      case "payment_intent.created":
        const paymentIntentCreated = event.data.object;
        // Then define and call a function to handle the event payment_intent.created
        break;
      case "payment_intent.partially_funded":
        const paymentIntentPartiallyFunded = event.data.object;
        // Then define and call a function to handle the event payment_intent.partially_funded
        break;
      case "payment_intent.payment_failed":
        const paymentIntentPaymentFailed = event.data.object;
        // Then define and call a function to handle the event payment_intent.payment_failed
        break;
      case "payment_intent.processing":
        const paymentIntentProcessing = event.data.object;
        // Then define and call a function to handle the event payment_intent.processing
        break;
      case "payment_intent.requires_action":
        const paymentIntentRequiresAction = event.data.object;
        // Then define and call a function to handle the event payment_intent.requires_action
        break;
      case "payment_intent.succeeded":
        const paymentIntentSucceeded = event.data.object;
        handlePayment(paymentIntentSucceeded);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    // console.log("event", event.type, JSON.stringify(event.data));
    res.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err?.message}`);
    return res.status(400).send(`Webhook Error: ${err?.message}`);
  }
};

async function handlePayment(paymentLogPayload: any) {
  try {
    const {
      metadata,
      id,
      client_secret,
      amount_received,
      currency,
      status,
      created,
    } = paymentLogPayload;

    const newTransaction = new transactionModel({
      user: metadata?.user,
      transactionId: id,
      orderId: client_secret,

      transactionAmount: amount_received,
      currency,

      transactionStatus: status,
      transactionDate: new Date(created * 1000),

      paymentGateway: "stripe",
      transactionObject: paymentLogPayload,
    });
    await newTransaction.save();
    if (
      status === "succeeded" &&
      metadata &&
      Number(metadata.type) === ORDER_TYPE.TOPUP
    ) {
      walletTopUp({
        amount: amount_received / 100,
        user: metadata?.user,
      });
      //TODO : distribute o reward
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

//{"object":{"id":"pi_3Q8ICA04BTECZQFq0VfUV25r","object":"payment_intent","amount":10000,"amount_capturable":0,"amount_details":{"tip":{}},"amount_received":10000,"application":null,"application_fee_amount":null,"automatic_payment_methods":null,"canceled_at":null,"cancellation_reason":null,"capture_method":"automatic","client_secret":"pi_3Q8ICA04BTECZQFq0VfUV25r_secret_FaaVbuvBBvJuYeu5YISY05rgv","confirmation_method":"automatic","created":1728550686,"currency":"inr","customer":null,"description":null,"invoice":null,"last_payment_error":null,"latest_charge":"ch_3Q8ICA04BTECZQFq0jYbI02u","livemode":false,"metadata":{"user":"66df1f0922419274fdd2b361","type":"1"},"next_action":null,"on_behalf_of":null,"payment_method":"pm_1Q8ICJ04BTECZQFqE4KCJWrT","payment_method_configuration_details":null,"payment_method_options":{"card":{"installments":null,"mandate_options":null,"network":null,"request_three_d_secure":"automatic"}},"payment_method_types":["card"],"processing":null,"receipt_email":null,"review":null,"setup_future_usage":null,"shipping":null,"source":null,"statement_descriptor":null,"statement_descriptor_suffix":null,"status":"succeeded","transfer_data":null,"transfer_group":null}}
