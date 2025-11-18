"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState, useEffect } from "react";
import { SortableItem } from "./SortableItem";

interface WishlistItemsProps {
  wishlist: any;
  isOwner: boolean;
  onUpdate: () => void;
}

export function WishlistItems({
  wishlist,
  isOwner,
  onUpdate,
}: WishlistItemsProps) {
  const [items, setItems] = useState(wishlist.items || []);

  // Update local state when wishlist prop changes
  useEffect(() => {
    setItems(wishlist.items || []);
  }, [wishlist]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex((item: any) => item._id === active.id);
      const newIndex = items.findIndex((item: any) => item._id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Update order on server
      try {
        await fetch(`/api/wishlists/${wishlist._id}/items`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itemIds: newItems.map((item: any) => item._id),
          }),
        });
      } catch (error) {
        console.error("Error reordering items:", error);
        // Revert on error
        setItems(items);
      }
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 text-lg">
          {isOwner
            ? "Your wishlist is empty. Add some items to get started!"
            : "This wishlist is empty."}
        </p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item: any) => item._id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {items.map((item: any, index: number) => (
              <SortableItem
                key={item._id}
                item={item}
                index={index}
                isOwner={isOwner}
                wishlistId={wishlist._id}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  // Non-owner view (no drag-and-drop)
  return (
    <div className="space-y-3">
      {items.map((item: any, index: number) => (
        <SortableItem
          key={item._id}
          item={item}
          index={index}
          isOwner={isOwner}
          wishlistId={wishlist._id}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
