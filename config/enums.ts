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
  PENDING = 1,
  COLLECTED = 2,
  VERIFIED = 3,
  RESOLD = 4,
  EXPIRED = 5,
  COMPLETED = 6,
}
export enum OFFER_TYPE {
  FRESH = "fresh",
  RESELL = "resell",
}

// paused
