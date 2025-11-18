"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect, useRef, memo } from "react";
import { Button } from "@/components/ui/Button";
import { NotificationsDropdown } from "./NotificationsDropdown";

export const Navigation = memo(function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hasFetched = useRef(false);
  const sessionUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch notifications once per user session
    const userId = session?.user?.id;

    if (!userId || hasFetched.current) return;

    // Check if this is a new user session
    if (sessionUserIdRef.current !== userId) {
      sessionUserIdRef.current = userId;
      hasFetched.current = false;
    }

    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [session?.user?.id]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/dashboard", label: "My Wishlist" },
    { href: "/wishlists", label: "Browse Wishlists" },
    { href: "/groups", label: "Groups" },
    { href: "/settings", label: "Settings" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 md:space-x-8 flex-1">
            <Link
              href="/dashboard"
              className="text-lg sm:text-xl md:text-2xl font-bold text-red-600 dark:text-red-500 truncate"
            >
              <span className="hidden sm:inline">🎄 Christmas Wishlist</span>
              <span className="sm:hidden">🎄 Wishlist</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Notification Dropdown */}
            <NotificationsDropdown
              unreadCount={unreadCount}
              onUnreadCountChange={setUnreadCount}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="hidden sm:flex"
            >
              Sign Out
            </Button>

            {/* Mobile Sign Out */}
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="sm:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              title="Sign Out"
            >
              🚪
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 text-base font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
});
