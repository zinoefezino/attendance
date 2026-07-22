import { Schema, model, models, Document } from "mongoose";

export interface IPerson extends Document {
  name: string;
  email: string;
  password?: string;
  gender: "male" | "female";
  role: "student" | "staff" | "admin";
  group?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
}

const PersonSchema = new Schema<IPerson>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "staff", "admin"],
      required: true,
    },
    group: { type: String },
    resetToken: { type: String },
    resetTokenExpires: { type: Date },
  },
  { timestamps: true },
);

export default models.Person || model<IPerson>("Person", PersonSchema);
