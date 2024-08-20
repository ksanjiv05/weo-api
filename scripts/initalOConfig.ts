import { OFFER_COLLECTION_EVENTS } from "../config/enums";
import logger from "../helper/logger";
import { OConfig } from "../models/o.config.model";
import Ownership from "../models/ownership.model";

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

export const run = async () => {
  try {
    await Ownership.updateMany(
      { "offer_access_codes.status": { $in: ["collected", "delivered"] } }, // Filter to find documents where status is "collected" or "delivered"
      [
        {
          $set: {
            offer_access_codes: {
              $map: {
                input: "$offer_access_codes",
                as: "code",
                in: {
                  $mergeObjects: [
                    "$$code",
                    {
                      status: {
                        $switch: {
                          branches: [
                            {
                              case: { $eq: ["$$code.status", "collected"] },
                              then: OFFER_COLLECTION_EVENTS.COLLECTED,
                            },
                            {
                              case: { $eq: ["$$code.status", "delivered"] },
                              then: OFFER_COLLECTION_EVENTS.VERIFIED,
                            },
                          ],
                          default: "$$code.status",
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      ]
    );
  } catch (error) {
    console.log("-.-", error);
  }
};
