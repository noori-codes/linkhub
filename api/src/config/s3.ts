import { S3Client, type S3ClientConfig } from "@aws-sdk/client-s3";

function required(name: keyof NodeJS.ProcessEnv): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is missing — needed for avatar uploads`);
  }
  return value;
}

/** Prefer standard AWS names; accept short aliases people often paste. */
function requiredCred(primary: keyof NodeJS.ProcessEnv, alias: string): string {
  const value = process.env[primary] || process.env[alias];
  if (!value) {
    throw new Error(
      `${primary} is missing — needed for avatar uploads (also accepts ${alias})`,
    );
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
      accessKeyId: requiredCred("S3_ACCESS_KEY_ID", "S3_ACCESS_KEY"),
      secretAccessKey: requiredCred("S3_SECRET_ACCESS_KEY", "S3_SECRET_KEY"),
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
