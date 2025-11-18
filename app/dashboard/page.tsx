"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { WishlistItems } from "@/components/wishlist/WishlistItems";
import { AddItemModal } from "@/components/wishlist/AddItemModal";
import { Confetti } from "@/components/animations/ChristmasAnimations";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasFetched = useRef(false);

  const fetchWishlist = useCallback(async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    if (!session?.user?.wishlistId) {
      console.log("No wishlistId found, session:", session);
      setLoading(false);
      return;
    }

    // Prevent duplicate fetches on initial load
    if (loading && hasFetched.current) {
      return;
    }
    hasFetched.current = true;

    try {
      const res = await fetch(`/api/wishlists/${session.user.wishlistId}`);
      const data = await res.json();
      setWishlist(data.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user, session?.user?.wishlistId, loading]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddItem = async (item: any) => {
    try {
      const res = await fetch(
        `/api/wishlists/${session?.user?.wishlistId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        }
      );

      if (res.ok) {
        setShowConfetti(true);
        setShowAddModal(false);
        fetchWishlist();
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-xl text-gray-900 dark:text-gray-100">
          Loading...
        </div>
      </div>
    );
  }

  if (!session?.user?.wishlistId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
              No Wishlist Found
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300">
              It looks like your account doesn't have a wishlist yet. Try
              signing out and signing back in to create one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <Confetti trigger={showConfetti} />

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2">
              My Wishlist 🎁
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Add items you'd love to receive this Christmas!
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto"
          >
            + Add Item
          </Button>
        </div>

        {wishlist && (
          <WishlistItems
            wishlist={wishlist}
            isOwner={true}
            onUpdate={fetchWishlist}
          />
        )}

        {showAddModal && (
          <AddItemModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddItem}
          />
        )}
      </div>
    </div>
  );
}
