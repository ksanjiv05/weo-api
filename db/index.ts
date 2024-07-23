// Objective: create a connection to the database
// author : sanjiv kumar pandit

import { DB_NAME, DB_URL } from "../config/config";
import mongoose, { Connection } from "mongoose";

// const connection = mongoose.connect(DB_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// connection
//   .then(() => {
//     console.log("db connected");
//   })
//   .catch((err: any) => {
//     console.log("connection err ", err);
//   });
class MongoDbInitConnection {
  private static _instance_v1: Connection;
  private static _instance_v2: Connection;

  private connection: any;

  private constructor(dbName: string) {
    try {
      console.log(`${DB_URL + dbName}?retryWrites=true`);
      this.connection = mongoose.createConnection(
        `${DB_URL + dbName}?retryWrites=true`,
        {
          maxPoolSize: 50,
        }
      );

      this.connection.on("connected", () =>
        console.log("connected", this.connection.host, " - ", dbName)
      );
      this.connection.on("open", () => console.log("open"));
      this.connection.on("disconnected", () => console.log("disconnected"));
    } catch (error) {
      console.log("db connection error ", error);
    }
    // this.connection
    //   .then(() => {
    //     console.log("db connected");
    //   })
    //   .catch((err: any) => {
    //     console.log("connection err ", err);
    //   });
  }

  public static getInstanceV1(version: string): Connection {
    if (!this._instance_v1) {
      if (DB_NAME) {
        console.log("DB_NAME ", DB_NAME);
        this._instance_v1 = new MongoDbInitConnection(DB_NAME).connection;
      } else {
        let dbName = version === "v1" ? "WEODB" : "WEODB_V2";
        console.log("dbName ", dbName);
        this._instance_v1 = new MongoDbInitConnection(dbName).connection;
      }
    }
    return this._instance_v1;
  }
  public static getInstanceV2(version: string): Connection {
    if (!this._instance_v2) {
      if (DB_NAME) {
        console.log("DB_NAME ", DB_NAME);
        this._instance_v2 = new MongoDbInitConnection(DB_NAME).connection;
      } else {
        let dbName = version === "v1" ? "WEODB" : "WEODB_V2";
        console.log("dbName ", dbName);
        this._instance_v2 = new MongoDbInitConnection(dbName).connection;
      }
    }
    return this._instance_v2;
  }
}

export const conn_v1: Connection = MongoDbInitConnection.getInstanceV1("v1");
export const conn_v2: Connection = MongoDbInitConnection.getInstanceV2("v2");

// Path: db/index.ts
