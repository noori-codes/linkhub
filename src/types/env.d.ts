declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production";
    DATABASE: string;

    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_COOKIE_EXPIRES_IN: string;
  }
}
