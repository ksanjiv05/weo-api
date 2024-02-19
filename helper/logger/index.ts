import fs from "fs";
import { ILog } from "../../interfaces/ILog";

export const logging = ({
  ip = "",
  method = "",
  url = "",
  status = -1,
  userAgent = "",
  responseTime = -1,
}: ILog) => {
  const fileName = new Date().toISOString().split("T")[0];
  const filePath = `./logs/${fileName}.log`;

  if (!fs.existsSync(filePath)) {
  }
};

// function onRequest(request, response) {
//     var clientIPaddr = null,
//         clientProxy = null;

//     // is client going through a proxy?
//     if (request.headers['via']) { // yes
//         clientIPaddr = request.headers['x-forwarded-for'];
//         clientProxy = request.headers['via'];
//     } else { // no
//         clientIPaddr = request.connection.remoteAddress;
//         clientProxy = "none";
//     }
//     var pathname = url.parse(request.url).pathname;
//     if (pathname!="/favicon.ico") {
//         console.log("&gt;&gt; Request for "+pathname);
//         console.log("&gt;&gt;&gt; Client : "+request.headers['user-agent']);
//         console.log("&gt;&gt;&gt; IP address "+clientIPaddr+" via proxy "+clientProxy);
//     }

//     // rest of request handling code
// }

import winston from "winston";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

// export const logger = winston.createLogger({
//   level: process.env.NODE_ENV == "dev" ? "debug" : "info",
//   format: winston.format.combine(
//     enumerateErrorFormat(),
//     process.env.NODE_ENV == "dev"
//       ? winston.format.colorize()
//       : winston.format.uncolorize(),
//     winston.format.splat(),
//     winston.format.printf(({ level, message }) => `${level}: ${message}`)
//   ),
//   transports: [
//     new winston.transports.Console({
//       stderrLevels: ["error"],
//     }),
//   ],
// });

//

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    enumerateErrorFormat(),
    process.env.NODE_ENV == "dev"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
    // winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export default logger;
