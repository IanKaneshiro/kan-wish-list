import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { User } from "@/lib/models/User";
import { Wishlist } from "@/lib/models/Wishlist";

// GET /api/groups - Get all groups for the current user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).populate("groups");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const groups = await Group.find({ _id: { $in: user.groups } })
      .populate("members", "name email image")
      .populate("createdBy", "name email");

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, inviteEmails } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Group name is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create group
    const group = await Group.create({
      name,
      members: [session.user.id],
      invites: inviteEmails || [],
      createdBy: session.user.id,
    });

    // Add group to user
    await User.findByIdAndUpdate(session.user.id, {
      $push: { groups: group._id },
    });

    // Update user's wishlist with the group ID if they don't have one yet
    const wishlist = await Wishlist.findOne({ ownerId: session.user.id });
    if (wishlist && !wishlist.groupId) {
      wishlist.groupId = group._id;
      await wishlist.save();
    }

    // TODO: Send email invitations to inviteEmails

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("Error creating group:", error);
    return NextResponse.json(
      { error: "Failed to create group" },
      { status: 500 }
    );
  }
}
