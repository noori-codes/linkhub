/** Host shown in product URL chips (override with NEXT_PUBLIC_APP_HOST). */
export function getAppHost() {
  if (process.env.NEXT_PUBLIC_APP_HOST) {
    return process.env.NEXT_PUBLIC_APP_HOST;
  }

  if (process.env.NODE_ENV === "development") {
    return "localhost:3001";
  }

  return "linkhub.app";
}
