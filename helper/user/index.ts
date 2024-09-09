import { hashSecretKey } from "../../config/config";
import Wallet, { IWallet } from "../../models/wallet.model";
import logger from "../logger";
import { oGenerate } from "../oCalculator/v2";
import { generateHash, generateHashWithKey } from "../utils";

export const addWallet = async (walletProps: IWallet) => {
  try {
    const { user, balance = 0, currency = "INR", name = "" } = walletProps;
    const wallet = new Wallet({ user, name, balance, currency });
    await wallet.save();
    return true;
  } catch (err) {
    logger.error("AddWallet", err);
    return false;
  }
};

export const updateWallet = async (wallet: IWallet, user: string) => {
  try {
    const recomputedHash = `${user}:${wallet.balance}:${wallet.oBalance}:${wallet.currency}`;

    console.log("dataToHash ", wallet.hash, recomputedHash);

    if (recomputedHash !== wallet.hash) {
      return new Error("Wallet authenticity verification failed");
    }

    // Generate and update the hash field
    wallet.hash = generateHashWithKey(hashSecretKey, recomputedHash);

    await wallet.save();
    return true;
  } catch (err) {
    logger.error("Update Wallet Error", err);
    return new Error("Update Wallet Error");
  }
};

export const walletTopUp = async ({
  amount,
  user,
}: {
  amount: number;
  user: string;
}) => {
  try {
    await Wallet.updateOne({ user }, { $inc: { balance: amount } });
    return true;
  } catch (err) {
    logger.error("BalanceUpdate", err);
    return false;
  }
};
