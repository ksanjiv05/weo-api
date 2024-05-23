export const generateOfferAccessCode = (
  offerId: string,
  lastSeqNum: number
) => {
  let sum = lastSeqNum + 1;
  return offerId + sum;
};
