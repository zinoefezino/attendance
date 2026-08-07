import { connectDB } from "@/lib/db";
import Person from "@/models/Person";
import AttendanceRecord from "@/models/AttendanceRecord";
import { NextRequest } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;

    const person = await Person.findByIdAndDelete(id);
    if (!person) {
      return Response.json({ error: "Person not found" }, { status: 404 });
    }

    await AttendanceRecord.deleteMany({ person: id });

    return Response.json({ success: true });
  } catch (err: any) {
    console.error("Failed to delete person:", err);
    return Response.json(
      { error: err?.message || "Failed to delete person." },
      { status: 500 },
    );
  }
}
