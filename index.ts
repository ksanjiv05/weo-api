import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express, { Express, Request, Response } from "express";
import swaggerUI from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import morgan from "morgan";
import { createStream } from "rotating-file-stream";
import "./db";
import router from "./routes/v1";
import helmet from "helmet";
//initial scripts
import "./scripts/category";
import rateLimiterMiddleware from "./middleware/rateLimiter";
import path from "path";
import { swaggerOptions } from "./config/swagger";
import loggingMiddleware from "./middleware/logger";
import routerV2 from "./routes/v2";

//end scripts

globalThis.__dirname = __dirname;
const app: Express = express();
const port = 4000;

//for http logging
const accessLogStream = createStream("api_request.log", {
  interval: "1d", // rotate daily
  path: path.join(__dirname, "logs"),
});
app.use(morgan("combined", { stream: accessLogStream }));

app.use(helmet());
app.disable("x-powered-by");
app.disable("etag");
//  app.use(helmet.noCache({ noEtag: true })); // set Cache-Control header
app.use(helmet.noSniff()); // set X-Content-Type-Options header
app.use(helmet.frameguard()); // set X-Frame-Options header
app.use(helmet.xssFilter()); // set X-XSS-Protection header
app.use(cors());

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

//logger
app.use(loggingMiddleware);

//rate limiter
app.use(rateLimiterMiddleware);

app.use("/static", express.static(path.join(__dirname, "uploads")));
app.use("/api/v1", router);
app.use("/api/v2", routerV2);

app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

//const {publicKey,privateKey} = generateKeyPair()
//const data = encryptData("hii sanjiv", __dirname + "/public.pem");
//console.log("data ", data);
//const dec = decryptText(data, __dirname + "/private.pem");
//console.log("data ", dec.toString("utf-8"));
//Transaction

// import "./helper/oCalculator/index";

const specs = swaggerJsdoc(swaggerOptions);
app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(specs, { explorer: true })
);
