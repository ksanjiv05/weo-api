import { DB_URL } from "../config/config";
const Mongoose = require("mongoose");

const connection = Mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

connection
  .then(() => {
    console.log("db connected");
  })
  .catch((err: any) => {
    console.log("connection err ", err);
  });
