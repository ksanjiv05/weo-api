import { Request, Response } from "express";
import multer from "multer";
import mkdirp from "mkdirp";
import { v4 } from "uuid";

const storage = multer.diskStorage({
  destination: function (req: Request, file, cb) {
    mkdirp.sync(globalThis.__dirname + "/uploads/category");
    cb(null, globalThis.__dirname + "/uploads/category");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = v4();
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage });
