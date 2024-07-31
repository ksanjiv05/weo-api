import { oNetworkConfig } from "../../../config/config";

const O_Config = {
  price: 1,
  oAgainstPrice: 100,
  ratio: 1 / 100,
  volume: 10000,
  preSetCutOff: 10,
  perSetCutOffFromDiscount: 1,
  toPlatformCutOff: 50,
  oReservedVolume: 10000,
};

export const oGenerate = async ({
  discount = 0,
  amount,
}: {
  discount: number;
  amount: number;
}) => {
  discount = discount / 100;
  console.log("discount ", discount);
  let oGenerateFromDiscount =
    amount * discount * (oNetworkConfig.atRateCutOffFromDiscount / 100) * 100;
  console.log(
    "oGenerateFromDiscount ",
    amount * discount,
    oNetworkConfig.atRateCutOffFromDiscount,
    oGenerateFromDiscount
  );
  let oGenerateFromTransactionValue =
    amount * (oNetworkConfig.atPlatformCutOffRate / 100) * 100;
  const totalO = Math.round(
    oGenerateFromTransactionValue + oGenerateFromDiscount
  ); //2 % discount 200
  const tenPOfDiscount = Math.round(
    totalO / (100 / oNetworkConfig.toPlatformCutOffRate)
  ); // 50% discount 50
  // O_Config.volume += tenPOfDiscount;
  return { toDistribute: totalO - tenPOfDiscount, totalO: totalO };
};
