import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});

export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});

export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().optional().or(z.literal("")),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  subjects: z.array(z.string()).optional(), // subject ids
});

export type TeacherSchema = z.infer<typeof teacherSchema>;

export const studentSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  img: z.string().optional(),
  bloodType: z.string().min(1, { message: "Blood Type is required!" }),
  birthday: z.coerce.date({ message: "Birthday is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Sex is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade is required!" }),
  classId: z.coerce.number().min(1, { message: "Class is required!" }),
  parentId: z.string().min(1, { message: "Parent Id is required!" }),
});

export type StudentSchema = z.infer<typeof studentSchema>;

export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Title name is required!" }),
  startTime: z.coerce.date({ message: "Start time is required!" }),
  endTime: z.coerce.date({ message: "End time is required!" }),
  lessonId: z.coerce.number({ message: "Lesson is required!" }),
});

export type ExamSchema = z.infer<typeof examSchema>;

export const commentSchema = z.object({
  id: z.coerce.number().optional(),
  content: z.string().min(1, { message: "Nội dung nhận xét không được để trống!" }),
  type: z.enum(["POSITIVE", "NEGATIVE", "NEUTRAL", "SUGGESTION"], { 
    message: "Loại nhận xét không hợp lệ!" 
  }),
  teacherId: z.string().min(1, { message: "Giáo viên không được để trống!" }),
  studentId: z.string().min(1, { message: "Học sinh không được để trống!" }),
  lessonId: z.coerce.number().optional(),
});

export type CommentSchema = z.infer<typeof commentSchema>;

export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Tiêu đề thông báo không được để trống!" }),
  description: z.string().min(1, { message: "Nội dung thông báo không được để trống!" }),
  date: z.coerce.date({ message: "Ngày thông báo không được để trống!" }),
  classId: z.coerce.number().optional(),
});

export type AnnouncementSchema = z.infer<typeof announcementSchema>;

export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Tiêu đề sự kiện không được để trống!" }),
  description: z.string().min(1, { message: "Mô tả sự kiện không được để trống!" }),
  startTime: z.coerce.date({ message: "Thời gian bắt đầu không được để trống!" }),
  endTime: z.coerce.date({ message: "Thời gian kết thúc không được để trống!" }),
  classId: z.coerce.number().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu!",
  path: ["endTime"],
});

export type EventSchema = z.infer<typeof eventSchema>;

export const resultSchema = z.object({
  id: z.coerce.number().optional(),
  score: z.coerce.number().min(0, { message: "Điểm không được âm!" }).max(100, { message: "Điểm không được vượt quá 100!" }),
  examId: z.coerce.number().optional(),
  assignmentId: z.coerce.number().optional(),
  studentId: z.string().min(1, { message: "Học sinh không được để trống!" }),
}).refine((data) => {
  // Phải có examId hoặc assignmentId, không được có cả hai
  return (data.examId && !data.assignmentId) || (!data.examId && data.assignmentId);
}, {
  message: "Phải chọn một bài thi hoặc bài tập!",
  path: ["examId"],
});

export type ResultSchema = z.infer<typeof resultSchema>;

export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Tiêu đề bài tập không được để trống!" }),
  startDate: z.coerce.date({ message: "Ngày bắt đầu không được để trống!" }),
  dueDate: z.coerce.date({ message: "Ngày hạn nộp không được để trống!" }),
  lessonId: z.coerce.number().min(1, { message: "Bài học không được để trống!" }),
}).refine((data) => data.dueDate > data.startDate, {
  message: "Ngày hạn nộp phải sau ngày bắt đầu!",
  path: ["dueDate"],
});

export type AssignmentSchema = z.infer<typeof assignmentSchema>;