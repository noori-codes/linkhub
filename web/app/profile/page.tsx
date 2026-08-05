import { redirect } from "next/navigation";

/** Dashboard home → Links (most common edit surface). */
export default function ProfileMenuPage() {
  redirect("/profile/links");
}
