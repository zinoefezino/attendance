import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Person from "@/models/Person";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await Person.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "This reset link is invalid or has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    return NextResponse.json(
      { message: "Password reset successfully." },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Password reset failed" },
      { status: 500 },
    );
  }
}
