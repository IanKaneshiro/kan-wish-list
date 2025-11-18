import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Wishlist } from "@/lib/models/Wishlist";

// PUT /api/wishlists/[wishlistId]/items/[itemId] - Update an item
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, price, link } = await request.json();

    await connectDB();

    const { id, itemId } = await params;
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
        { error: "Not authorized to edit this wishlist" },
        { status: 403 }
      );
    }

    const item = wishlist.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Update item fields
    if (name !== undefined) item.name = name;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price;
    if (link !== undefined) item.link = link;
    item.updatedAt = new Date();

    await wishlist.save();

    // TODO: Notify claimers if item was edited

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlists/[wishlistId]/items/[itemId] - Delete an item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id, itemId } = await params;
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
        { error: "Not authorized to delete from this wishlist" },
        { status: 403 }
      );
    }

    const itemIndex = wishlist.items.findIndex(
      (i) => i._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    wishlist.items.splice(itemIndex, 1);

    // Reorder remaining items
    wishlist.items.forEach((item, index) => {
      item.order = index;
    });

    await wishlist.save();

    return NextResponse.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Failed to delete item" },
      { status: 500 }
    );
  }
}
