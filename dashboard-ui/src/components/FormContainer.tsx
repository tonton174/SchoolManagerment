import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import FormModal from "./FormModal";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement"
    | "comment";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
  onSuccess?: () => void;
};

const FormContainer = async ({ table, type, data, id, onSuccess }: FormContainerProps) => {
  let relatedData = {};

  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: subjectTeachers };
        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;
      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        const studentParents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
        });
        relatedData = { classes: studentClasses, grades: studentGrades, parents: studentParents, canEditClass: role === "admin" };
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;
      case "comment":
        let commentStudents;
        let commentClasses: Array<{ id: number; name: string }> = [];
        let commentLessons = [] as any[];

        if (role === "teacher") {
          // Đơn giản hoá để đảm bảo có dữ liệu: trả về toàn bộ học sinh + toàn bộ lớp
          commentStudents = await prisma.student.findMany({ include: { class: true } });
          commentClasses = await prisma.class.findMany({ select: { id: true, name: true } });
          commentLessons = [];
          relatedData = { students: commentStudents, lessons: commentLessons, classes: commentClasses };
        } else {
          // Admin / role khác: tất cả
          commentStudents = await prisma.student.findMany({ include: { class: true } });
          commentClasses = await prisma.class.findMany({ select: { id: true, name: true } });
          commentLessons = [];
          relatedData = { students: commentStudents, lessons: commentLessons, classes: commentClasses };
        }
        break;
      case "lesson":
        const lessonSubjects = await prisma.subject.findMany({ select: { id: true, name: true } });
        const lessonClasses = await prisma.class.findMany({ select: { id: true, name: true } });
        const lessonTeachers = await prisma.teacher.findMany({ select: { id: true, name: true, surname: true } });
        relatedData = { subjects: lessonSubjects, classes: lessonClasses, teachers: lessonTeachers };
        break;
      case "announcement":
        const announcementClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: announcementClasses };
        break;
      case "event":
        const eventClasses = await prisma.class.findMany({
          select: { id: true, name: true },
        });
        relatedData = { classes: eventClasses };
        break;
      case "result":
        const resultStudents = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
        });
        const resultExams = await prisma.exam.findMany({
          select: { id: true, title: true },
        });
        const resultAssignments = await prisma.assignment.findMany({
          select: { id: true, title: true },
        });
        relatedData = { 
          students: resultStudents, 
          exams: resultExams, 
          assignments: resultAssignments 
        };
        break;
      case "assignment":
        let assignmentLessonsQuery: any = {
          include: {
            subject: { select: { name: true } },
            class: { select: { name: true } },
          },
        };

        // Nếu là teacher, chỉ lấy lessons mà họ quản lý
        if (role === "teacher") {
          assignmentLessonsQuery.where = {
            teacherId: currentUserId,
          };
        }

        const assignmentLessons = await prisma.lesson.findMany(assignmentLessonsQuery);
        relatedData = { lessons: assignmentLessons };
        break;
      default:
        break;
    }
  }

  return (
    <div className="">
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default FormContainer;