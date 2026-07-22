import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/models/AttendanceRecord";
import { NextRequest } from "next/server";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// GET /api/attendance?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || todayStr();

  const records = await AttendanceRecord.find({ date }).populate("person");
  return Response.json(records);
}

interface AttendanceBody {
  personId: string;
  action: "signin" | "signout";
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { personId, action }: AttendanceBody = await request.json();
  const date = todayStr();

  let record = await AttendanceRecord.findOne({ person: personId, date });

  if (action === "signin") {
    if (record) {
      return Response.json(
        { error: "Already signed in today" },
        { status: 400 },
      );
    }
    record = await AttendanceRecord.create({
      person: personId,
      date,
      signInTime: new Date(),
    });
  } else if (action === "signout") {
    if (!record) {
      return Response.json(
        { error: "No sign-in found for today" },
        { status: 400 },
      );
    }
    record.signOutTime = new Date();
    await record.save();
  }

  return Response.json(record);
}
