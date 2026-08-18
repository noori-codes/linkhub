"use client";

import Link from "next/link";

import { useClientAuth } from "@/components/ClientAuthProvider";
import { uiBtnPrimary } from "@/lib/ui";

export default function HomeAuthActions() {
  const { loggedIn } = useClientAuth();

  return loggedIn ? (
    <Link href="/profile" className={`${uiBtnPrimary} px-5`}>
      Open profile
    </Link>
  ) : (
    <Link href="/signup" className={`${uiBtnPrimary} px-5`}>
      Get your page
    </Link>
  );
}
