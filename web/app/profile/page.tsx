import { redirect } from "next/navigation";

/** Dashboard entry → Links editor (most common next action). */
export default function ProfileMenuPage() {
  redirect("/profile/links");
}
