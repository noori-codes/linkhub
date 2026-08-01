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

    // Next.js app origin — used in password-reset emails
    FRONTEND_URL?: string;
  }
}
