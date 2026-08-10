declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";

    DATABASE: string;

    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_COOKIE_EXPIRES_IN: string;

    EMAIL_FROM: string;
    EMAIL_HOST: string;
    EMAIL_PORT: string;
    EMAIL_USERNAME: string;
    EMAIL_PASSWORD: string;

    // Next.js app origin — used in password-reset + email-verify links
    FRONTEND_URL?: string;

    // S3-compatible storage (avatar uploads)
    S3_BUCKET?: string;
    S3_REGION?: string;
    S3_ACCESS_KEY_ID?: string;
    S3_SECRET_ACCESS_KEY?: string;
    S3_ENDPOINT?: string;
    S3_PUBLIC_URL?: string;
    /** Seconds until a signed GET URL expires (default 3600). */
    S3_SIGNED_URL_EXPIRES?: string;
  }
}
