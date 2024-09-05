import { OConfig } from "../../../models/o.config.model";

export const getOConfig = async () => {
  const oConfig = await OConfig.findOne();
  return oConfig;
};

export const oGenerate =  ({
  discount = 0,
  amount,
  oNetworkConfig,
}: {
  discount: number;
  amount: number;
  oNetworkConfig: any;
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
