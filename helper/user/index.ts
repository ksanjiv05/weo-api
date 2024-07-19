import Wallet, { IWallet } from "../../models/wallet.model";
import logger from "../logger";
import { generateHash } from "../utils";

export const addWallet = async (walletProps: IWallet) => {
  try {
    const { user, balance = 0, currency = "INR", name = "" } = walletProps;
    const toBeVerifyString = balance.toString() + "-" + name.toString();
    const verifyString = generateHash(toBeVerifyString);
    const wallet = new Wallet({ user, name, balance, currency, verifyString });
    await wallet.save();
    return true;
  } catch (err) {
    logger.error("AddWallet", err);
    return false;
  }
};
