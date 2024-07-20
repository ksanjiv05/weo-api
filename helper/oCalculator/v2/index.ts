
 const O_Config={
      price: 1,
      oAgainstPrice: 100,
      ratio: 1 / 100,
      volume: 10000,
      preSetCutOff: 10,
      perSetCutOffFromDiscount: 1,
      toPlatformCutOff: 50,
      oReservedVolume: 10000,
    }


export const oGenerate = async ({discount=0, amount}:{discount:number, amount:number}) => {
  discount = discount / 100;
  let oGenerateFromDiscount =
    amount * discount * (O_Config.perSetCutOffFromDiscount / 100) * 100;
  let oGenerateFromTransactionValue =
    amount * (O_Config.preSetCutOff / 100) * 100;
  const totalO = Math.round(
    oGenerateFromTransactionValue + oGenerateFromDiscount
  ); //2 % discount 200
  const tenPOfDiscount = Math.round(
    totalO / (100 / O_Config.toPlatformCutOff)
  ); // 50% discount 50
  O_Config.volume += tenPOfDiscount;
  return { toDistribute: totalO - tenPOfDiscount, totalO: totalO };
};


