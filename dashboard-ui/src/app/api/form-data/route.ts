import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get("table");
    const type = searchParams.get("type");

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = userId;

    if (!table || !type) {
      return NextResponse.json({ error: "Missing table or type parameter" }, { status: 400 });
    }

    let data: any = {};

    switch (table) {
      case "comment":
        // Lấy danh sách học sinh dựa trên role
        let students: any[] = [];
        let teachers: any[] = [];
        
        if (role === "admin") {
          // Admin có thể comment cho tất cả học sinh
          students = await prisma.student.findMany({
            include: { 
              class: true 
            },
            orderBy: [
              { name: 'asc' },
              { surname: 'asc' }
            ]
          });
          // Lấy danh sách giáo viên cho admin chọn
          teachers = await prisma.teacher.findMany({
            select: { id: true, name: true, surname: true },
            orderBy: [
              { name: 'asc' },
              { surname: 'asc' }
            ]
          });
        } else if (role === "teacher" && currentUserId) {
          // Teacher chỉ có thể comment cho học sinh trong lớp họ dạy hoặc là supervisor
          const teacherClasses = await prisma.class.findMany({
            where: {
              OR: [
                { supervisorId: currentUserId }, // Là supervisor của lớp
                { 
                  lessons: { 
                    some: { 
                      teacherId: currentUserId 
                    } 
                  } 
                } // Dạy lesson trong lớp này
              ]
            },
            include: {
              students: {
                include: { class: true }
              }
            }
          });

          // Lấy tất cả học sinh từ các lớp có quyền
          students = teacherClasses.flatMap(cls => cls.students);
          
          // Loại bỏ duplicate students (nếu học sinh ở nhiều lớp)
          const uniqueStudents = new Map();
          students.forEach(student => {
            if (!uniqueStudents.has(student.id)) {
              uniqueStudents.set(student.id, student);
            }
          });
          students = Array.from(uniqueStudents.values());
          
          // Sắp xếp theo tên
          students.sort((a, b) => {
            if (a.name !== b.name) return a.name.localeCompare(b.name);
            return a.surname.localeCompare(b.surname);
          });
        } else {
          // Student/Parent không có quyền comment
          students = [];
        }

        // Lấy danh sách bài học (chỉ cho teacher)
        let lessons: any[] = [];
        if (role === "teacher" && currentUserId) {
          lessons = await prisma.lesson.findMany({
            where: { 
              teacherId: currentUserId 
            },
            include: { 
              subject: true 
            },
            orderBy: [
              { name: 'asc' }
            ]
          });
        }

        data = {
          students: students.map(student => ({
            id: student.id,
            name: student.name,
            surname: student.surname,
            class: { name: student.class.name }
          })),
          lessons: lessons.map(lesson => ({
            id: lesson.id,
            name: lesson.name,
            subject: { name: lesson.subject.name }
          })),
          ...(role === "admin" ? { teachers } : {})
        };
        break;

      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
          orderBy: [
            { name: 'asc' },
            { surname: 'asc' }
          ]
        });
        data = { teachers: subjectTeachers };
        break;

      case "class":
        const classGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
          orderBy: { level: 'asc' }
        });
        const classTeachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
          orderBy: [
            { name: 'asc' },
            { surname: 'asc' }
          ]
        });
        
        // Lấy danh sách lớp dựa trên role
        let classes: any[] = [];
        if (role === "admin") {
          // Admin thấy tất cả lớp
          classes = await prisma.class.findMany({
            include: { 
              grade: true,
              _count: { select: { students: true } }
            },
            orderBy: { name: 'asc' }
          });
        } else if (role === "teacher" && currentUserId) {
          // Teacher chỉ thấy lớp họ dạy hoặc là supervisor
          classes = await prisma.class.findMany({
            where: {
              OR: [
                { supervisorId: currentUserId },
                { lessons: { some: { teacherId: currentUserId } } }
              ]
            },
            include: { 
              grade: true,
              _count: { select: { students: true } }
            },
            orderBy: { name: 'asc' }
          });
        }
        
        data = { 
          teachers: classTeachers, 
          grades: classGrades,
          classes: classes
        };
        break;

      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
          orderBy: { name: 'asc' }
        });
        data = { subjects: teacherSubjects };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
          orderBy: { level: 'asc' }
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
          orderBy: { name: 'asc' }
        });
        data = { classes: studentClasses, grades: studentGrades };
        break;

      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
          orderBy: { name: 'asc' }
        });
        data = { lessons: examLessons };
        break;

      default:
        return NextResponse.json({ error: "Unsupported table" }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching form data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 