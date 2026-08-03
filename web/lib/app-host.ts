/** Host shown in marketing URL chips (override with NEXT_PUBLIC_APP_HOST). */
export function getAppHost() {
  return process.env.NEXT_PUBLIC_APP_HOST ?? "linkhub.app";
}
