import logger from "../helper/logger";
import { OConfig } from "../models/o.config.model";

export const initOConfig = async () => {
  try {
    const isOConfigExist = await OConfig.findOne();
    if (isOConfigExist) {
      return;
    }

    const oConfig = new OConfig({
      currency: "USD",
      oAgainstPrice: 100,
      volume: 100000,
      oReservedVolume: 100000,
      atPlatformCutOffRate: 10,
      atRateCutOffFromDiscount: 100,
      toPlatformCutOffRateFromDiscount: 0,
      toPlatformCutOffRate: 10,
    });
    await oConfig.save();
  } catch (error) {
    logger.error("O Config Init Error", error);
    console.log(error);
  }
};
