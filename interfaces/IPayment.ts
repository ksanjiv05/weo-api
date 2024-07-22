interface Card {
  id: string;
  entity: string;
  name: string;
  last4: string;
  network: string;
  type: string;
  issuer: string | null;
  international: boolean;
  emi: boolean;
  sub_type: string;
  token_iin: string | null;
}

interface Notes {
  type: number;
  user: string;
}

interface AcquirerData {
  auth_code: string;
}

export interface IPayment {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  invoice_id: string | null;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status: string | null;
  captured: boolean;
  description: string;
  card_id: string;
  card: Card;
  bank: string | null;
  wallet: string | null;
  vpa: string | null;
  email: string;
  contact: string;
  notes: any;
  fee: number;
  tax: number;
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: AcquirerData;
  emi_plan: string | null;
  created_at: number;
  reward: string | null;
  base_amount: number;
}
