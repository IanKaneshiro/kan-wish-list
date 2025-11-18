import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/db";
import { User } from "@/lib/models/User";

// GET /api/settings - Get user settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      settings: user.settings,
      paymentInfo: user.paymentInfo,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emailNotifications, reduceMotion, paymentInfo } =
      await request.json();

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update settings
    if (emailNotifications !== undefined) {
      user.settings.emailNotifications = emailNotifications;
    }
    if (reduceMotion !== undefined) {
      user.settings.reduceMotion = reduceMotion;
    }

    // Update payment info
    if (paymentInfo) {
      user.paymentInfo = {
        ...user.paymentInfo,
        ...paymentInfo,
      };
    }

    await user.save();

    return NextResponse.json({
      message: "Settings updated successfully",
      settings: user.settings,
      paymentInfo: user.paymentInfo,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
