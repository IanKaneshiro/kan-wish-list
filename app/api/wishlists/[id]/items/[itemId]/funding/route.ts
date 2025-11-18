import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Wishlist } from "@/lib/models/Wishlist";

// PUT /api/wishlists/[wishlistId]/items/[itemId]/funding - Update funding/buyer info
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pledge, newBuyerId, markAsPaid, markAsPurchased } =
      await request.json();

    await connectDB();

    const { id, itemId } = await params;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    const item = wishlist.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const userClaim = item.claims.find(
      (c) => c.userId.toString() === session.user.id
    );
    if (!userClaim) {
      return NextResponse.json(
        { error: "You have not claimed this item" },
        { status: 403 }
      );
    }

    // Update pledge amount
    if (pledge !== undefined) {
      userClaim.pledge = pledge;
    }

    // Mark payment as received
    if (markAsPaid) {
      userClaim.paidAt = new Date();
    }

    // Reassign buyer
    if (newBuyerId) {
      // Remove buyer status from all claims
      item.claims.forEach((c) => (c.isBuyer = false));

      // Assign to new buyer
      const newBuyerClaim = item.claims.find(
        (c) => c.userId.toString() === newBuyerId
      );
      if (newBuyerClaim) {
        newBuyerClaim.isBuyer = true;
      }
    }

    // Mark item as purchased
    if (markAsPurchased && userClaim.isBuyer) {
      item.status = "purchased";
    }

    await wishlist.save();

    // TODO: Emit Socket.io event for real-time update
    // TODO: Send notifications to contributors

    return NextResponse.json({
      message: "Funding updated successfully",
      item,
    });
  } catch (error) {
    console.error("Error updating funding:", error);
    return NextResponse.json(
      { error: "Failed to update funding" },
      { status: 500 }
    );
  }
}
