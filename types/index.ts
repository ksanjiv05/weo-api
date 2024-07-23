export type BankAccount = {
  ifsc_code: string;
  uid: string;
  email: string;
  contact: string;
  business_name: string;
  beneficiary_name: string;
  account_type: string;
  account_number: string;
  name: string;
  isUpdate?: boolean;
  contactId: string | undefined | null;
};

export type ContactProps = {
  name: string;
  email: string;
  contact: string;
  type: string;
  reference_id: string;
  notes: any;
};

export type VirtualAccount = {
  ifsc: string;
  account_number: string;
  description: string;
  uid: string;
  bank_name: string;
};

export type OrderCreateOptions = {
  amount: number;
  currency?: string;
  receipt: string;
  partial_payment?: boolean;
  notes?: undefined | any;
};

export type OfferPlan = {
  period: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  item: {
    name: string;
    amount: number;
    currency: string;
    description?: string;
  };
  notes?: {
    notes_key_1: string;
    notes_key_2: string;
  };
};

export type OfferSubscription = {
  plan_id: string;
  total_count: number;
  quantity: number;
  customer_notify: number;
  start_at: number;
  expire_by: number;
  addons: any[];
  notes: any;
};

export type TransferFromPayment = {
  paymentId: string;
  account: string;
  amount: number;
  currency: string;
  name: string;
};

export type TransferFromAmount = {
  account: string;
  amount: number;
  currency: string;
  amounToTransfer: number;
  name: string;
};

export type TransferFromOrder = {
  orderId: string;
  account: string;
  amount: number;
  currency: string;
  name: string;
};

export type TransferFromAccount = {
  account: string;
  amount: number;
  currency: string;
};

export type RefundFromPayment = {
  paymentId: string;
  amount: number;
  notes: any;
};
