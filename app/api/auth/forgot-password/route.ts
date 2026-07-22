import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import Person from "@/models/Person";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    await connectDB();

    const user = await Person.findOne({ email: String(email).toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent." },
        { status: 200 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    user.resetToken = token;
    user.resetTokenExpires = expiresAt;
    await user.save();

    const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: [user.email],
        subject: "Reset your password",
        html: `<p>Hello ${user.name},</p><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 30 minutes.</p>`,
      });
    }

    return NextResponse.json(
      { message: "If an account exists, a reset link has been sent." },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to send reset email" },
      { status: 500 },
    );
  }
}
