import { connectDB } from "@/lib/db";
import AttendanceRecord from "@/models/AttendanceRecord";
import { NextRequest } from "next/server";

const OFFICE_TIMEZONE = "Africa/Lagos";

function getOfficeTimeParts() {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: OFFICE_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const map: Record<string, string> = {};
  parts.forEach((p) => (map[p.type] = p.value));

  return {
    hours: parseInt(map.hour, 10),
    minutes: parseInt(map.minute, 10),
    dateStr: `${map.year}-${map.month}-${map.day}`,
  };
}

function todayStr() {
  return getOfficeTimeParts().dateStr;
}

// GET /api/attendance?date=YYYY-MM-DD
// GET /api/attendance?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
export async function GET(request: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const query =
    startDate && endDate
      ? { date: { $gte: startDate, $lte: endDate } }
      : { date: date || todayStr() };

  const records = await AttendanceRecord.find(query).populate("person");
  return Response.json(records);
}

interface AttendanceBody {
  personId: string;
  action: "signin" | "signout";
}

export async function POST(request: NextRequest) {
  await connectDB();
  const { personId, action }: AttendanceBody = await request.json();
  const { hours, minutes, dateStr: date } = getOfficeTimeParts();

  let record = await AttendanceRecord.findOne({ person: personId, date });

  if (action === "signin") {
    const isNightLocked = hours >= 18 || hours < 6;
    if (isNightLocked) {
      return Response.json(
        { error: "Sign-in is closed for the night. It reopens at 6:00 AM." },
        { status: 403 },
      );
    }

    if (record) {
      return Response.json(
        { error: "Already signed in today" },
        { status: 400 },
      );
    }

    const isLate = hours > 9 || (hours === 9 && minutes > 10);

    record = await AttendanceRecord.create({
      person: personId,
      date,
      signInTime: new Date(),
      isLate,
    });
  } else if (action === "signout") {
    if (!record) {
      return Response.json(
        { error: "No sign-in found for today" },
        { status: 400 },
      );
    }
    if (record.signOutTime) {
      return Response.json(
        { error: "Already signed out today" },
        { status: 400 },
      );
    }
    record.signOutTime = new Date();
    await record.save();
  }

  return Response.json(record);
}
