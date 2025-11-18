"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/ThemeProvider";
import { Theme } from "@/lib/constants/theme";

interface Settings {
  emailNotifications: boolean;
  reduceMotion: boolean;
  theme: Theme;
}

interface PaymentInfo {
  venmo?: string;
  paypal?: string;
  cashapp?: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    theme: currentTheme,
    effectiveTheme,
    setTheme: setGlobalTheme,
  } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    reduceMotion: false,
    theme: currentTheme,
  });
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    venmo: "",
    paypal: "",
    cashapp: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Sync local settings with global theme
  useEffect(() => {
    setSettings((prev) => ({ ...prev, theme: currentTheme }));
  }, [currentTheme]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        const fetchedSettings = data.settings || settings;
        setSettings((prev) => ({
          ...prev,
          emailNotifications: fetchedSettings.emailNotifications,
          reduceMotion: fetchedSettings.reduceMotion,
          theme: fetchedSettings.theme || currentTheme,
        }));
        setPaymentInfo(data.paymentInfo || paymentInfo);
        // Ensure global theme matches fetched settings
        if (fetchedSettings.theme && fetchedSettings.theme !== currentTheme) {
          setGlobalTheme(fetchedSettings.theme);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailNotifications: settings.emailNotifications,
          reduceMotion: settings.reduceMotion,
          theme: settings.theme,
          paymentInfo,
        }),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const isDark = effectiveTheme === "dark";

  return (
    <div
      className={`container mx-auto px-4 py-8 max-w-2xl ${
        isDark ? "" : "text-gray-900"
      }`}
    >
      <h1
        className={`text-3xl font-bold mb-6 ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Settings
      </h1>

      {/* Notification Settings */}
      <section
        className={`${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-lg shadow-md border p-6 mb-6`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Preferences
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="emailNotifications"
                className={`font-medium ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Email Notifications
              </label>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Receive email updates about your wishlists and group activities
              </p>
            </div>
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  emailNotifications: e.target.checked,
                })
              }
              className="w-5 h-5 rounded accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="reduceMotion"
                className={`font-medium ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Reduce Motion
              </label>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Minimize animations and transitions
              </p>
            </div>
            <input
              type="checkbox"
              id="reduceMotion"
              checked={settings.reduceMotion}
              onChange={(e) =>
                setSettings({ ...settings, reduceMotion: e.target.checked })
              }
              className="w-5 h-5 rounded accent-blue-600"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="theme"
                className={`font-medium ${
                  isDark ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Theme
              </label>
              <p
                className={`text-sm ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Choose your preferred color scheme
              </p>
            </div>
            <select
              id="theme"
              value={settings.theme}
              onChange={(e) => {
                const newTheme = e.target.value as Theme;
                setSettings({
                  ...settings,
                  theme: newTheme,
                });
                // Update theme immediately for preview
                setGlobalTheme(newTheme);
              }}
              className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-gray-100"
                  : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </section>

      {/* Payment Information */}
      <section
        className={`${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        } rounded-lg shadow-md border p-6 mb-6`}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Payment Information
        </h2>
        <p
          className={`text-sm mb-4 ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Add your payment details so others can contribute to your wishlist
          items
        </p>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="venmo"
              className={`block font-medium mb-2 ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Venmo Username
            </label>
            <input
              type="text"
              id="venmo"
              value={paymentInfo.venmo || ""}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, venmo: e.target.value })
              }
              placeholder="@username"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="paypal"
              className={`block font-medium mb-2 ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              PayPal Email or Username
            </label>
            <input
              type="text"
              id="paypal"
              value={paymentInfo.paypal || ""}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, paypal: e.target.value })
              }
              placeholder="email@example.com"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>

          <div>
            <label
              htmlFor="cashapp"
              className={`block font-medium mb-2 ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              Cash App Username
            </label>
            <input
              type="text"
              id="cashapp"
              value={paymentInfo.cashapp || ""}
              onChange={(e) =>
                setPaymentInfo({ ...paymentInfo, cashapp: e.target.value })
              }
              placeholder="$username"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                isDark
                  ? "border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
              }`}
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </Button>
        {message && (
          <span
            className={`text-sm font-medium ${
              message.includes("success") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
