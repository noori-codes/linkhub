import { redirect } from "next/navigation";

/** Old Photos URL → Profile (photos live with identity now) */
export default function ProfilePhotosRedirect() {
  redirect("/profile/about");
}
