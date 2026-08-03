import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

function required(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing — needed for avatar uploads`);
  }
  return value;
}

/** Lazy so the API can boot without S3 until someone uploads. */
let client: S3Client | null = null;

export function getS3Config() {
  return {
    bucket: required("S3_BUCKET"),
    region: process.env.S3_REGION || "auto",
    publicUrl: required("S3_PUBLIC_URL").replace(/\/$/, ""),
    endpoint: process.env.S3_ENDPOINT || undefined,
  };
}

export function getS3Client() {
  if (client) return client;

  const { region, endpoint } = getS3Config();

  const config: S3ClientConfig = {
    region,
    credentials: {
      accessKeyId: required("S3_ACCESS_KEY_ID"),
      secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
    },
  };

  // R2 / MinIO need a custom endpoint; real AWS S3 does not
  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = true;
  }

  client = new S3Client(config);
  return client;
}
