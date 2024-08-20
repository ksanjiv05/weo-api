export enum STATUS {
  PENDING = 1,
  LIVE = 2,
  PAUSED = 3,
  DELETED = 4,
}

export enum OFFER_STATUS {
  PENDING = 1,
  LIVE = 2,
  PAUSED = 3,
  DELETED = 4,
  SOLD = 5,
  EXPIRED = 6,
  REJECTED = 7,
}

export enum ORDER_TYPE {
  TOPUP = 1,
  PURCHASE = 2,
}

export enum O_EVENTS {
  COLLECTED = "collected",
}

export enum OFFER_COLLECTION_EVENTS {
  COLLECTED = 1,
  RESOLD = 2,
  EXPIRED = 3,
  // DELIVERED = "delivered",
  VERIFIED = 4,
  COMPLETED = 5,
}
export enum OFFER_TYPE {
  FRESH = "fresh",
  RESELL = "resell",
}

// paused
