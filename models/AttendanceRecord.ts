import { Schema, model, models, Document, Types } from "mongoose";

export interface IAttendanceRecord extends Document {
  person: Types.ObjectId;
  date: string;
  signInTime?: Date;
  signOutTime?: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    person: { type: Schema.Types.ObjectId, ref: "Person", required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    signInTime: { type: Date },
    signOutTime: { type: Date },
  },
  { timestamps: true },
);

AttendanceRecordSchema.index({ person: 1, date: 1 }, { unique: true });

export default models.AttendanceRecord ||
  model<IAttendanceRecord>("AttendanceRecord", AttendanceRecordSchema);
