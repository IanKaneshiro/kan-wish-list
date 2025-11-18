"use client";

import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Navigation } from "./Navigation";

export function ChristmasLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  // Memoize navigation to prevent re-renders
  const navigation = useMemo(() => {
    return session ? <Navigation /> : null;
  }, [session?.user?.id]); // Only re-render when user ID changes

  return (
    <div className="min-h-screen bg-linear-to-b from-red-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {navigation}

      <main className="relative z-10">{children}</main>
    </div>
  );
}
