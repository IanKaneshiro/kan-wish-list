import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Wishlist } from "@/lib/models/Wishlist";
import mongoose from "mongoose";

const MAX_ITEMS = parseInt(process.env.MAX_ITEMS_PER_WISHLIST || "50");

// POST /api/wishlists/[id]/items - Add an item to a wishlist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, link } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const { id } = await params;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (wishlist.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to add items to this wishlist" },
        { status: 403 }
      );
    }

    // Check item limit
    if (wishlist.items.length >= MAX_ITEMS) {
      return NextResponse.json(
        {
          error: `Maximum ${MAX_ITEMS} items allowed per wishlist`,
        },
        { status: 400 }
      );
    }

    // Create new item
    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      name,
      description: description || "",
      price: price || 0,
      link: link || "",
      order: wishlist.items.length, // Add at the end
      claims: [],
      status: "available" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    wishlist.items.push(newItem);
    await wishlist.save();

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error adding item:", error);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// PUT /api/wishlists/[id]/items - Reorder items
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemIds } = await request.json();

    if (!itemIds || !Array.isArray(itemIds)) {
      return NextResponse.json(
        { error: "Item IDs array is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const { id } = await params;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Check if user is the owner
    if (wishlist.ownerId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to reorder this wishlist" },
        { status: 403 }
      );
    }

    // Update order based on new itemIds array
    itemIds.forEach((itemId, index) => {
      const item = wishlist.items.find((i) => i._id.toString() === itemId);
      if (item) {
        item.order = index;
      }
    });

    // Sort items by order
    wishlist.items.sort((a, b) => a.order - b.order);
    await wishlist.save();

    return NextResponse.json({ message: "Items reordered successfully" });
  } catch (error) {
    console.error("Error reordering items:", error);
    return NextResponse.json(
      { error: "Failed to reorder items" },
      { status: 500 }
    );
  }
}
