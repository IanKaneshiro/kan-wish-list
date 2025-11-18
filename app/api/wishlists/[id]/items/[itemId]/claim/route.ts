import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Wishlist } from "@/lib/models/Wishlist";
import { Group } from "@/lib/models/Group";
import { User } from "@/lib/models/User";

// POST /api/wishlists/[wishlistId]/items/[itemId]/claim - Claim an item or join as contributor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pledge, isBuyer } = await request.json();

    await connectDB();

    const { id, itemId } = await params;
    const wishlist = await Wishlist.findById(id);
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Check if user is not the owner
    if (wishlist.ownerId.toString() === session.user.id) {
      return NextResponse.json(
        { error: "Cannot claim items on your own wishlist" },
        { status: 403 }
      );
    }

    // Check if user has access (member of the group)
    const group = await Group.findById(wishlist.groupId);
    if (
      !group ||
      !group.members.some((m) => m.toString() === session.user.id)
    ) {
      return NextResponse.json(
        { error: "Not authorized to claim items on this wishlist" },
        { status: 403 }
      );
    }

    const item = wishlist.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if user already claimed this item
    const existingClaim = item.claims.find(
      (c) => c.userId.toString() === session.user.id
    );
    if (existingClaim) {
      return NextResponse.json(
        { error: "Already claimed this item" },
        { status: 400 }
      );
    }

    // Add claim
    const newClaim = {
      userId: session.user.id,
      pledge: pledge || 0,
      isBuyer: isBuyer || item.claims.length === 0, // First claimer is buyer by default
      createdAt: new Date(),
    };

    item.claims.push(newClaim as any);
    item.status = "claimed";
    await wishlist.save();

    // Add notification to claimer
    const claimer = await User.findById(session.user.id);
    const owner = await User.findById(wishlist.ownerId);

    if (claimer) {
      claimer.notifications.push({
        message: `You claimed "${item.name}" for ${owner?.name}`,
        type: "claim",
        itemId: item._id,
        wishlistId: wishlist._id,
        fromUserId: wishlist.ownerId,
        read: false,
        createdAt: new Date(),
      } as any);
      await claimer.save();
    }

    // TODO: Emit Socket.io event for real-time update
    // TODO: Send email notification if enabled

    return NextResponse.json({
      message: "Item claimed successfully",
      claim: newClaim,
    });
  } catch (error) {
    console.error("Error claiming item:", error);
    return NextResponse.json(
      { error: "Failed to claim item" },
      { status: 500 }
    );
  }
}

// DELETE /api/wishlists/[wishlistId]/items/[itemId]/claim - Unclaim an item
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

    const item = wishlist.items.find((i) => i._id.toString() === itemId);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const claimIndex = item.claims.findIndex(
      (c) => c.userId.toString() === session.user.id
    );
    if (claimIndex === -1) {
      return NextResponse.json(
        { error: "No claim found for this item" },
        { status: 404 }
      );
    }

    const wasBuyer = item.claims[claimIndex].isBuyer;
    item.claims.splice(claimIndex, 1);

    // If there are no claims left, mark as available
    if (item.claims.length === 0) {
      item.status = "available";
    } else if (wasBuyer && item.claims.length > 0) {
      // If the buyer unclaimed, assign a new buyer
      item.claims[0].isBuyer = true;
    }

    await wishlist.save();

    // TODO: Emit Socket.io event for real-time update

    return NextResponse.json({ message: "Item unclaimed successfully" });
  } catch (error) {
    console.error("Error unclaiming item:", error);
    return NextResponse.json(
      { error: "Failed to unclaim item" },
      { status: 500 }
    );
  }
}
