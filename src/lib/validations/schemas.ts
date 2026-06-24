import { z } from "zod";
import { ANIMAL_CONDITIONS } from "@/lib/constants";

const conditionValues = ANIMAL_CONDITIONS.map((c) => c.value) as [
  string,
  ...string[],
];

export const reportCaseSchema = z.object({
  reporterName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อผู้แจ้ง")
    .max(100, "ชื่อยาวเกินไป"),
  phoneNumber: z
    .string()
    .min(9, "กรุณากรอกเบอร์โทรศัพท์")
    .max(15, "เบอร์โทรศัพท์ไม่ถูกต้อง")
    .regex(/^[0-9+\-\s()]+$/, "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง"),
  wantsToAdopt: z.boolean(),
  condition: z.enum(conditionValues as [string, ...string[]]),
  description: z
    .string()
    .min(10, "กรุณาอธิบายอาการอย่างน้อย 10 ตัวอักษร")
    .max(1000, "คำอธิบายยาวเกินไป"),
  province: z.string().min(1, "กรุณาเลือกจังหวัด"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const clinicLoginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
});

export const caseUpdateSchema = z.object({
  note: z
    .string()
    .min(5, "กรุณากรอกบันทึกอย่างน้อย 5 ตัวอักษร")
    .max(2000),
});

export const animalSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อสัตว์"),
  gender: z.enum(["MALE", "FEMALE", "UNKNOWN"]),
  estimatedAge: z.string().min(1, "กรุณากรอกอายุโดยประมาณ"),
  weight: z.number().positive().optional(),
  description: z.string().min(10, "กรุณากรอกคำอธิบาย"),
  personality: z.string().optional(),
  vaccinationStatus: z.boolean(),
  sterilizationStatus: z.boolean(),
});

export type ReportCaseFormData = z.infer<typeof reportCaseSchema>;
export type ClinicLoginFormData = z.infer<typeof clinicLoginSchema>;
export type CaseUpdateFormData = z.infer<typeof caseUpdateSchema>;
export type AnimalFormData = z.infer<typeof animalSchema>;
