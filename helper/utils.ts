//encryption
import * as fs from "fs";
import crypto from "crypto";
import QRCode from "qrcode";
import { Transform } from "stream";
import logging from "../config/logging";
import jwt from "jsonwebtoken";

class AppendInitVect extends Transform {
  appended: Boolean;
  initVect: Buffer;
  constructor(initVect: Buffer, opts?: any) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(chunk: any, encoding: string, cb: () => void) {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

function getCipherKey(password: string) {
  return crypto.createHash("sha256").update(password).digest();
}

interface EncProp {
  filePath: string;
  password: string;
  cb: (arg: Boolean) => void;
}

export const encrypt = ({ filePath, password, cb }: EncProp) => {
  // Generate a secure, pseudo random initialization vector.
  const initVect = crypto.randomBytes(16);
  const CIPHER_KEY = getCipherKey(password);

  const readStream = fs.createReadStream(filePath);
  const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  // Create a write stream with a different file extension.
  const writeStream = fs.createWriteStream(filePath + ".enc");

  readStream.pipe(cipher).pipe(appendInitVect).pipe(writeStream);
  writeStream.on("finish", () => {
    logging.info("Encrypt", "File successfully encrypt");
    fs.unlink(filePath, (err) => {
      if (err) logging.error("Encrypt", "File not deleted!");
    });
    cb(true);
  });
  writeStream.on("error", () => {
    logging.error("Encrypt", "File unable encrypt");
    cb(false);
  });
};

export const decrypt = ({ filePath, password, cb }: EncProp) => {
  // First, get the initialization vector from the file.
  const readInitVect = fs.createReadStream(filePath, { end: 15 });

  let initVect: Buffer | string;
  readInitVect.on("data", (chunk) => {
    initVect = chunk;
  });

  // Once we’ve got the initialization vector, we can decrypt the file.
  readInitVect.on("close", () => {
    const cipherKey = getCipherKey(password);
    const readStream = fs.createReadStream(filePath, { start: 16 });
    const decipher = crypto.createDecipheriv("aes256", cipherKey, initVect);
    const writeStream = fs.createWriteStream(filePath.slice(0, -4));

    readStream.pipe(decipher).pipe(writeStream);
    writeStream.on("finish", () => {
      logging.info("Dicrypt", "File successfully decrypted");
      cb(true);
    });
    writeStream.on("error", () => {
      logging.error("Dicrypt", "File unable decrypted");
      cb(false);
    });
  });
};

export function encryptText(plainText: string, public_key_path: string) {
  return crypto.publicEncrypt(
    {
      key: fs.readFileSync(public_key_path, "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(plainText)
  );
}

export function decryptText(encryptedText: Buffer, private_key_path: string) {
  return crypto.privateDecrypt(
    {
      key: fs.readFileSync(private_key_path, "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    encryptedText
  );
}

export const generateKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

  const exportedPublicKeyBuffer = publicKey.export({
    type: "pkcs1",
    format: "pem",
  });
  fs.writeFileSync(
    globalThis.__dirname + "/public.pem",
    exportedPublicKeyBuffer,
    { encoding: "utf-8" }
  );

  const exportedPrivateKeyBuffer = privateKey.export({
    type: "pkcs1",
    format: "pem",
  });
  fs.writeFileSync(
    globalThis.__dirname + "/private.pem",
    exportedPrivateKeyBuffer,
    { encoding: "utf-8" }
  );

  return { publicKey, privateKey };
};

export const encryptTextWithPassword = ({
  filePath,
  password,
  cb,
}: EncProp) => {
  // Generate a secure, pseudo random initialization vector.
  const initVect = crypto.randomBytes(16);
  const CIPHER_KEY = getCipherKey(password);

  // const readStream = fs.createReadStream(filePath);
  const cipher = crypto.createCipheriv("aes256", CIPHER_KEY, initVect);
  // const appendInitVect = new AppendInitVect(initVect);
  // Create a write stream with a different file extension.

  cipher.update("hii sanjiv");
};

// Function to generate SHA-256 hash
/**
 * Verifies the SHA-256 hash of the provided data.
 *
 * @param {string} data - The data to be hashed .
 * @return {string} Returns  the generated hash.
 */
export const generateHashWithKey = (key: string, data: string) => {
  // const hash = crypto.createHash("sha256").update(data).digest("hex");
  return crypto.createHmac("sha256", key).update(data).digest("hex");
};

export const generateHash = (data: string) => {
  const hash = crypto.createHash("sha256").update(data).digest("hex");
  return hash;
};

// Function to verify SHA-256 hash
/**
 * Verifies the SHA-256 hash of the provided data.
 *
 * @param {string} data - The data to be hashed and verified.
 * @param {string} hash - The hash to be compared with the generated hash.
 * @return {boolean} Returns true if the generated hash matches the provided hash, false otherwise.
 */
export const verifyHash = (data: string, hash: string) => {
  const dataHash = generateHash(data);
  return dataHash === hash;
};

/**
 * Take the difference between the dates and divide by milliseconds per day.
 * Round to nearest whole number to deal with DST.
 */
export function getDaysBetweenTwoDate(startDate: any, endDate: any) {
  const endTime = new Date(endDate).getTime();
  const startTime = new Date(startDate).getTime();
  console.log(endTime, "--", startTime);
  return Math.round((endTime - startTime) / (1000 * 60 * 60 * 24));
}

// With async/await
export const generateQR = async (text: string) => {
  try {
    const opts = {
      dark: "#010599FF",
      light: "#FFBF60FF",
    };

    const qr = await QRCode.toDataURL(text);
    return qr;
  } catch (err) {
    console.error(err);
    return null;
  }
};
