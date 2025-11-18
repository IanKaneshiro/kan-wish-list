import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { User } from "@/lib/models/User";
import { Wishlist } from "@/lib/models/Wishlist";

// POST /api/groups/[groupId]/join - Accept invitation and join group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { groupId } = await params;
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user's email is in the invites
    if (!group.invites.includes(user.email)) {
      return NextResponse.json(
        { error: "No invitation found for this user" },
        { status: 403 }
      );
    }

    // Check if user is already a member
    if (group.members.some((m) => m.toString() === session.user.id)) {
      return NextResponse.json(
        { error: "Already a member of this group" },
        { status: 400 }
      );
    }

    // Add user to group members
    group.members.push(user._id);
    // Remove from invites
    group.invites = group.invites.filter((email) => email !== user.email);
    await group.save();

    // Add group to user's groups
    user.groups.push(group._id);
    await user.save();

    // Update user's wishlist with group ID
    const wishlist = await Wishlist.findOne({ ownerId: user._id });
    if (wishlist && !wishlist.groupId) {
      wishlist.groupId = group._id;
      await wishlist.save();
    }

    return NextResponse.json({
      message: "Successfully joined group",
      group,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}
