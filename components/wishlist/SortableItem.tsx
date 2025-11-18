"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

interface SortableItemProps {
  item: any;
  index: number;
  isOwner: boolean;
  wishlistId: string;
  onUpdate: () => void;
}

export function SortableItem({
  item,
  index,
  isOwner,
  wishlistId,
  onUpdate,
}: SortableItemProps) {
  const [showFunding, setShowFunding] = useState(false);
  const [pledge, setPledge] = useState("");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._id, disabled: !isOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClaim = async () => {
    try {
      const res = await fetch(
        `/api/wishlists/${wishlistId}/items/${item._id}/claim`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pledge: pledge ? parseFloat(pledge) : 0 }),
        }
      );

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error claiming item:", error);
    }
  };

  const handleUnclaim = async () => {
    try {
      const res = await fetch(
        `/api/wishlists/${wishlistId}/items/${item._id}/claim`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error unclaiming item:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const res = await fetch(
        `/api/wishlists/${wishlistId}/items/${item._id}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const totalPledged =
    item.claims?.reduce((sum: number, claim: any) => sum + claim.pledge, 0) ||
    0;
  const isClaimed = item.claims?.length > 0;
  const userClaim = item.claims?.find(
    (c: any) => c.userId === "current-user-id"
  ); // TODO: Get current user ID

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow p-3 sm:p-4 ${
        isOwner && "cursor-move"
      } ${
        index < 3 && isOwner
          ? "border-2 border-yellow-400 dark:border-yellow-600"
          : ""
      }`}
    >
      <div className="flex items-start gap-2 sm:gap-4">
        {isOwner && (
          <div
            {...attributes}
            {...listeners}
            className="text-xl sm:text-2xl cursor-grab active:cursor-grabbing touch-none"
          >
            ⋮⋮
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="truncate">{item.name}</span>
                {index < 3 && isOwner && (
                  <span className="text-yellow-500 shrink-0">⭐</span>
                )}
              </h3>
              {item.description && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {item.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {item.price > 0 && (
                  <span className="shrink-0">💰 ${item.price.toFixed(2)}</span>
                )}
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                  >
                    View Link →
                  </a>
                )}
              </div>
            </div>

            {!isOwner && (
              <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                {!userClaim ? (
                  <Button
                    size="sm"
                    onClick={handleClaim}
                    className="flex-1 sm:flex-none"
                  >
                    Claim 🎁
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleUnclaim}
                    className="flex-1 sm:flex-none"
                  >
                    Unclaim
                  </Button>
                )}

                {isClaimed && (
                  <button
                    onClick={() => setShowFunding(!showFunding)}
                    className="text-xs sm:text-sm text-blue-600 hover:underline whitespace-nowrap"
                  >
                    {showFunding ? "Hide" : "View"} Funding
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <Button
                size="sm"
                variant="danger"
                onClick={handleDelete}
                className="shrink-0"
              >
                Delete
              </Button>
            )}
          </div>

          {!isOwner && isClaimed && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Claimed by {item.claims.length}{" "}
                {item.claims.length === 1 ? "person" : "people"}
              </div>

              {showFunding && item.price > 0 && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm text-gray-900 dark:text-gray-100 mb-1">
                    <span>Funding Progress:</span>
                    <span>
                      ${totalPledged.toFixed(2)} / ${item.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          (totalPledged / item.price) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>

                  {userClaim && !userClaim.pledge && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={pledge}
                        onChange={(e) => setPledge(e.target.value)}
                        placeholder="Pledge amount"
                        className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          /* TODO: Update pledge */
                        }}
                      >
                        Pledge
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
