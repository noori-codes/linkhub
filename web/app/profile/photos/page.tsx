import { redirect } from "next/navigation";

export default function ProfilePhotosRedirect() {
  redirect("/profile/about");
}
