import { Response, Request } from "express";
import { responseObj } from "../../helper/response";

// const getOPrice = (req: Request, res: Response) => {
//   try {
//     const oPrice = 10; //get o price
//     responseObj({
//       resObj: res,
//       type: "success",
//       statusCode: 200,
//       msg: "here your latest o price ",
//     });
//   } catch (error) {
//     responseObj({});
//   }
// };

for (let i = 0; i < 10; i++) {
  console.log(i);
}