import bcrypt from "bcryptjs";
import Person from "@/models/Person";
import { connectDB } from "@/lib/db";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, email, password, gender, role, group } = await req.json();

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingPerson = await Person.findOne({ email: normalizedEmail });

    if (existingPerson) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const newPerson = await Person.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      gender,
      role,
      group: String(group || "").trim(),
      status: "approved",
    });

    return Response.json(newPerson, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Registration failed";

    return Response.json(
      {
        error: "Unable to connect to the database. Please try again later.",
        details: message,
      },
      { status: 500 },
    );
  }
}
