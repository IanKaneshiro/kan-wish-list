"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    fetchWishlist();
  }, [session]);

  const fetchWishlist = async () => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    if (!session?.user?.wishlistId) {
      console.log("No wishlistId found, session:", session);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/wishlists/${session.user.wishlistId}`);
      const data = await res.json();
      setWishlist(data.wishlist);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session?.user?.wishlistId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-2">
              No Wishlist Found
            </h2>
            <p className="text-yellow-700">
              It looks like your account doesn't have a wishlist yet. Try signing out and signing back in to create one.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Confetti trigger={showConfetti} />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              My Wishlist 🎁
            </h1>
            <p className="text-gray-600">
              Add items you'd love to receive this Christmas!
            </p>
          </div>

          <Button onClick={() => setShowAddModal(true)}>+ Add Item</Button>
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
