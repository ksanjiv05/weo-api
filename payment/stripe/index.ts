import { Request, Response } from "express";
import { stripe } from "../../config/config";

export const deposit = async (req: Request, res: Response) => {
  try {
    const { amount, currency, source, description, cid } = req.body;
    const charge = await stripe.paymentIntents.create(
      {
        amount,
        currency,
        // source: "tok_visa",
        customer: cid,
        payment_method_types: ["card"],
        description,
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey: Math.random().toString(36).substring(7),
      }
    );
    res.json(charge);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { email, name, description } = req.body;
    const customer = await stripe.customers.create({
      email,
      name,
      description,
    });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPaymentIntent = async (req: Request, res: Response) => {
  try {
    const clientSecret = await stripe.paymentIntents.create(
      {
        amount: 200,
        // payment_method: "usd",
        payment_method_types: ["card"], //["google_pay"],
        currency: "inr",
        // gateway: "googlepay",
      },
      {
        idempotencyKey: Math.random().toString(36).substring(7),
      }
    );
    console.log("clientSecret", clientSecret);
    res.status(200).json({
      clientSecret: clientSecret.client_secret,
    });
  } catch (err) {
    console.log("err", err);
    res.status(500).json({ error: err });
  }
};

// {
//     "id": "cus_PthH7K7mSTKpUC",
//     "object": "customer",
//     "address": null,
//     "balance": 0,
//     "created": 1712727577,
//     "currency": null,
//     "default_source": null,
//     "delinquent": false,
//     "description": "test",
//     "discount": null,
//     "email": "kumarsanjiv0005@gmail.com",
//     "invoice_prefix": "35D20516",
//     "invoice_settings": {
//         "custom_fields": null,
//         "default_payment_method": null,
//         "footer": null,
//         "rendering_options": null
//     },
//     "livemode": false,
//     "metadata": {},
//     "name": "sanjiv",
//     "next_invoice_sequence": 1,
//     "phone": null,
//     "preferred_locales": [],
//     "shipping": null,
//     "tax_exempt": "none",
//     "test_clock": null
// }
