// O
// 100 Os/Offer/Creator (or Collector)

// Each O within the context of an Offer represent a percentage point. One O=1%

// Every user has their unique O value relative to their monetary transaction volume :
// x%/$1 of Offer price = (x)O/$1

// For example, let’s say an individual has done $1000 of business over 5 transactions, with each transaction earning
// her 82.4 Os on average. Her individual O value would be
// 82.4/100 or 0.824 Os/$1 or $0.82/O

// The WEO platform or the network O price (tradable, interoperable O price) is determined by the total aggregate individual O price average (My Os/$1)/Total $in Network =Network O value (rating/trust score)

// For example, with 128,492 total users with an average O value price of $0.796/O across $7,594,955.78 of total network transactions would make the current O price
// $7,594,955.78 / 128,492 = $59.10 average transactions per user x $0.79 = $46 worth of Os per user.

// Therefore current O price would be $46x 0.79 / 59.10 = $0.61

// So as creators price their Offers with Os as discounts, the O amount relative to price is determined by the current network O price of $0.61/O

// %My O value+%Offer access discount =Offer Access Price

// The collector can access said Offer by the Os they have accrued at their own rate (transaction history) relative to the current O price.

// So I’m the case of the first user example, whose personal O price was $0.82/O, if she is to access an Offer that requires her to have 340 Os at the network O price of $0.61/O, her cost would be the converted rate.

// Current O price for Offer
// 340 x $0.61 = $207.40
// Her O price for the same Offer
// (207.40 x 100)/$0.82 = 265.63
// She would only need to hold 265.63 Os instead of the 340 because of her O value generated from her transaction history

// Overall O logic summary :

// 1. Every transaction per every Offer can generate up to 100% of Os
// 2. Each O in the context of a transaction is worth 1% of the transaction amount.
// 3. Transaction histories generate an O valuation average for each user less than or equal to 100%
// 4. Individual O valuation determines the cost of Os for that particular user across the platform/network
// 5. The O prices set for access and rewards/discounts are determined by network averages of average O valuations per user multiplied by the number of total users, then divided by total network transactions
// 6. Os do not have fungible values outside the network, though buying power in network is directly determined by proof of performance across the network, or average O price as described above

// 1 O = 1% = $1

export const oValueCalc = (
  transactionValue: number, // Transaction value
  totalNumberOfTransactions: number // Total number of transactions
) => {
  return (transactionValue / totalNumberOfTransactions) * 100;
};

// For example, let’s say an individual has done $1000 of business over 5 transactions, with each transaction earning her 82.4 Os on average. Her individual O value would be :
// 82.4/100 or 0.824 Os/$1 or $0.82/O

export const individualOValueCalc = (
  totalOEarned: number, // Total O earned by the user
  totalNumberOfTransactions: number // Total number of transactions by the user
) => {
  const avgOValue = totalOEarned / totalNumberOfTransactions;
  return avgOValue / 100; // O value per $1
};

// For example, with 128,492 total users with an average O value price of $0.796/O across $7,594,955.78 of total network transactions would make the current O price
// $7,594,955.78 / 128,492 = $59.10 average transactions per user x $0.79 = $46 worth of Os per user.
// Therefore current O price would be $46x 0.79 / 59.10 = $0.61
// 59.10 * 0.796 = 46.98

export const networkOPriceCalc = (
  avgOValue: number, // Average O value of users
  totalTransactionValue: number, // Total transaction value
  totalNumberOfUsers: number // Total number of users
) => {
  const currentOPrice = totalTransactionValue / totalNumberOfUsers;
  return (currentOPrice * avgOValue * avgOValue) / currentOPrice;
};
// %My O value+%Offer access discount =Offer Access Price

// The collector can access said Offer by the Os they have accrued at their own rate (transaction history) relative to the current O price.

// So I’m the case of the first user example, whose personal O price was $0.82/O, if she is to access an Offer that requires her to have 340 Os at the network O price of $0.61/O, her cost would be the converted rate.

// Current O price for Offer
// 340 x $0.61 = $207.40
// Her O price for the same Offer
// (207.40 x 100)/$0.82 = 265.63
// She would only need to hold 265.63 Os instead of the 340 because of her O value generated from her transaction history

export const offerAccessPriceCalc = (
  requiredO: number,
  _userORate: number,
  networkORate: number
) => {
  const currentOPrice = requiredO * networkORate;
  const userOPrice = (currentOPrice * 100) / _userORate;
  return userOPrice;
};

console.log("value is : = ", networkOPriceCalc(0.796, 7594955.78, 128492));
