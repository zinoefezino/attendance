import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required." },
        { status: 400 },
      );
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Incorrect administrative password." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    // Set an HTTP-only secure cookie for authentication state
    response.cookies.set({
      name: "admin_token",
      value: "authenticated",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 8, // Expires in 8 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 },
    );
  }
}
