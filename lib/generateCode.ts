import Person from "@/models/Person";

export async function generateUniqueCode(): Promise<string> {
  let code: string;
  let exists = true;

  do {
    code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    exists = !!(await Person.findOne({ code }));
  } while (exists);

  return code;
}
