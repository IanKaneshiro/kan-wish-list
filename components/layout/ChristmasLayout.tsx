"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import {
  Snowflakes,
  TwinklingLights,
} from "@/components/animations/ChristmasAnimations";
import { Navigation } from "./Navigation";

export function ChristmasLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Fetch user settings if logged in
    if (session?.user) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.settings) {
            setReduceMotion(data.settings.reduceMotion);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-green-50">
      <Snowflakes disabled={reduceMotion} />
      <TwinklingLights disabled={reduceMotion} />

      {session && <Navigation />}

      <main className="relative z-10">{children}</main>
    </div>
  );
}
