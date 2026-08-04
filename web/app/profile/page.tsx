import { redirect } from "next/navigation";

/** Dashboard entry → first editor section (3-column shell always has an open page). */
export default function ProfileMenuPage() {
  redirect("/profile/about");
}
