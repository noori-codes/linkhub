import { redirect } from "next/navigation";

/** Old Photos URL → Avatar */
export default function ProfilePhotosRedirect() {
  redirect("/profile/avatar");
}
