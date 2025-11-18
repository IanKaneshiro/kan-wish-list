import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Wishlist } from "@/lib/models/Wishlist";
import { Group } from "@/lib/models/Group";

// GET /api/wishlists/[id] - Get a specific wishlist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const wishlist = await Wishlist.findById(id).populate(
      "ownerId",
      "name email image"
    );
    if (!wishlist) {
      return NextResponse.json(
        { error: "Wishlist not found" },
        { status: 404 }
      );
    }

    // Check if user has access to this wishlist
    const isOwner = wishlist.ownerId._id.toString() === session.user.id;

    // If not the owner, check if user is a member of the group
    if (!isOwner) {
      if (!wishlist.groupId) {
        return NextResponse.json(
          { error: "Not authorized to view this wishlist" },
          { status: 403 }
        );
      }

      const group = await Group.findById(wishlist.groupId);
      if (
        !group ||
        !group.members.some((m) => m.toString() === session.user.id)
      ) {
        return NextResponse.json(
          { error: "Not authorized to view this wishlist" },
          { status: 403 }
        );
      }
    }

    // If user is the owner, hide claim information
    if (isOwner) {
      // Remove claim information for the owner
      const sanitizedWishlist = wishlist.toObject();
      sanitizedWishlist.items = sanitizedWishlist.items.map((item) => ({
        ...item,
        claims: [],
        status: "available",
      }));
      return NextResponse.json({ wishlist: sanitizedWishlist, isOwner: true });
    }

    return NextResponse.json({ wishlist, isOwner: false });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}
