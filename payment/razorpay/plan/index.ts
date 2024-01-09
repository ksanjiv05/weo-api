import instance from "..";
import { OfferPlan } from "../../../types";

export const createPlan = async ({
  period = "monthly",
  interval,
  item,
  notes,
}: OfferPlan) => {
  try {
    const response = await instance.plans.create({
      period,
      interval,
      item: {
        name: item.name,
        amount: item.amount,
        currency: item.currency,
        description: item.description,
      },
      notes,
    });
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};

export const getPlan = async (planId: string) => {
  try {
    const response = await instance.plans.fetch(planId);
    return response;
  } catch (error: any) {
    console.log(error);
    return null;
  }
};
