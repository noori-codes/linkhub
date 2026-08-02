import { redirect } from "next/navigation";

// Old bookmarks / links → new owner hub
export default function DashboardRedirect() {
  redirect("/profile");
}
