import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Person from "@/models/Person";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, group } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await connectDB();

    const existingUser = await Person.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email is already registered" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Person.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "student",
      group: group || "",
      status: "approved", // Automatically active upon creation
    });

    return NextResponse.json(
      { message: "User registered successfully", user: newUser },
      { status: 201 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 },
    );
  }
}
