//https://github.com/razorpay/razorpay-node/blob/master/documents/qrcode.md

import instance from "..";

export const createQR = async (
  storeName: string,
  payment_amount: number,
  description: string,
  customer_id: string,
  close_by: number //timestump
) => {
  try {
    const response = await instance.qrCode.create({
      type: "upi_qr",
      name: storeName,
      usage: "single_use",
      fixed_amount: true,
      payment_amount,
      description,
      customer_id,
      close_by,
      notes: {
        purpose: "Test UPI QR code notes",
      },
      //if you want to add tax invoice
      //   tax_invoice: {
      //     number: "INV001",
      //     date: 1589994898,
      //     customer_name: "Gaurav Kumar",
      //     business_gstin: "06AABCU9605R1ZR",
      //     gst_amount: 4000,
      //     cess_amount: 0,
      //     supply_type: "interstate",
      //   },
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};
