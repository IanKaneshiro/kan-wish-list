import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { Group } from "@/lib/models/Group";
import { User } from "@/lib/models/User";

// POST /api/groups/[groupId]/invite - Send invitations to join group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "Email addresses are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const { groupId } = await params;
    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // Check if user is a member of the group
    if (!group.members.some((m) => m.toString() === session.user.id)) {
      return NextResponse.json(
        { error: "Not authorized to invite to this group" },
        { status: 403 }
      );
    }

    // Add emails to invites (avoid duplicates)
    const newInvites = emails.filter((email) => !group.invites.includes(email));
    group.invites.push(...newInvites);
    await group.save();

    // TODO: Send email invitations

    return NextResponse.json({
      message: "Invitations sent successfully",
      invitedEmails: newInvites,
    });
  } catch (error) {
    console.error("Error sending invitations:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 }
    );
  }
}
