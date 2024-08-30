import axios from "axios";
import { exchangeRateApiKey } from "../../config/config";

export const getExchangeRate = async (from: string, to: string) => {
  try {
    const res = await axios.get(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${exchangeRateApiKey}&base_currency=${from.toUpperCase()}`
    );
    if (res.data.data) {
      return res.data.data[to.toUpperCase()]; // res.data.data[from];
    }

    return 0;
  } catch (err) {
    console.log(err);
    return 0;
  }
};
