import { bucketName } from "../../config/config";
import client from "./aws";
import {
  ListObjectsCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

export const listS3Buckets = async () => {
  try {
    const list = await client.listBuckets();
    return list.Buckets;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const deleteS3File = async (key: string) => {
  try {
    const input = {
      Bucket: bucketName,
      Key: key,
    };
    const command = new DeleteObjectCommand(input);
    await client.send(command);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const listS3Files = async () => {
  try {
    const input = {
      Bucket: bucketName,
    };
    const command = new ListObjectsCommand(input);
    const response = await client.send(command);
    return response.Contents;
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const deleteS3Files = async (keys: string[]) => {
  try {
    const input = {
      Bucket: bucketName,
      Delete: {
        Objects: keys.map((key) => ({ Key: key })),
      },
    };
    const command = new DeleteObjectsCommand(input);
    await client.send(command);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
