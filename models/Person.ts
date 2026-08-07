import { Schema, model, models, Document } from "mongoose";

export interface IPerson extends Document {
  name: string;
  role: "student" | "staff";
  group?: string;
  code: string;
}

const PersonSchema = new Schema<IPerson>(
  {
    name: { type: String, required: true },
    role: { type: String, enum: ["student", "staff"], required: true },
    group: { type: String },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default models.Person || model<IPerson>("Person", PersonSchema);
