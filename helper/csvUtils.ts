import { Response } from "express";
import { Parser, transforms as t } from "json2csv";
import Collector from "../models/Collector";

// const parser = new Transform(opts, asyncOpts, transformOpts);
// const parser = new AsyncParser(opts, asyncOpts, transformOpts);
const transforms = [t.unwind({ paths: ["offerMedia"] })];
export const exportCsv = async (
  data: any,
  collectionName: string,
  response: Response
) => {
  // collectionName = "collector";
  // const user = await Collector.find({}).lean();
  // console.log(user);
  const parser = new Parser({});
  const csv = parser.parse(data);

  const filename = `${collectionName}-${new Date()
    .toString()
    .split(" ")
    .slice(0, 6)
    .join("-")}.csv`;
  //   const csvBuffer = new Uint8Array(Buffer.from(asString(csv)));
  response.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  response.setHeader("Content-Type", "text/csv");
  response.setHeader("Content-Length", csv.length);
  response.send(csv);

  //   cursor.eachAsync((doc) => {
  //     console.log(doc);
  //   });
  //   cursor.
  //   response.send(csvBuffer);
  // cursor
  //   .stream()
  //   .pipe(csvBuffer)
  //   .pipe(response)
  //   .on("finish", () => {
  //     console.log("Done sending CSV data");
  //   })
  //   .on("error", (err) => {
  //     console.error("Error while streaming CSV data:", err);
  //     res.status(500).send("Error while streaming CSV data");
  //   });
  //   writeFile(filename, csvBuffer, (err) => {
  //     if (err) {
  //       console.error(err);
  //     }
  //   });
};

//  const transformOpts = { highWaterMark: 16384, encoding: "utf-8" };
//  const json2csv = new Transform(opts, transformOpts);

//  // Start the response stream
//  json2csv.pipe(res);

//  // Get a cursor for all documents
//  const cursor = User.find().cursor();

//  // Process each document
//  cursor
//    .eachAsync((doc) => {
//      json2csv.write(doc);
//    })
//    .then(() => {
//      json2csv.end(); // End the CSV stream
//    });
