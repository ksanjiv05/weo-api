import instance from "..";
import logging from "../../../config/logging";
import { OrderCreateOptions } from "../../../types";

export const createOrder = async ({
  amount,
  currency = "INR",
  receipt,
  partial_payment = false,
  notes,
}: OrderCreateOptions) => {
  try {
    const order = await instance.orders.create({
      amount,
      currency,
      receipt,
      partial_payment,
      notes,
    });
    return order;
  } catch (error: any) {
    logging.error("RazorPay", "Order Create Error", error);
    return null;
  }
};

export const fetchOrder = async (orderId: string) => {
  try {
    const order = await instance.orders.fetch(orderId);
    return order;
  } catch (error: any) {
    logging.error("RazorPay", "Order Fetch Error", error);
    return null;
  }
};

export const fetchAllOrders = async () => {
  try {
    const orders = await instance.orders.all();
    return orders;
  } catch (error: any) {
    logging.error("RazorPay", "Order Fetch All Error", error);
    return null;
  }
};

export const fetchPayments = async (orderId: string) => {
  try {
    const payments = await instance.orders.fetchPayments(orderId);
    return payments;
  } catch (error: any) {
    logging.error("RazorPay", "Order Fetch Payment Error", error);
    return null;
  }
};
