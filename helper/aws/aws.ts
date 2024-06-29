import * as AWS from "@aws-sdk/client-s3";
import { accessKeyId, region, secretAccessKey } from "../../config/config";
const client = new AWS.S3({
  credentials: {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
  },
  region: region,
});

export default client;
