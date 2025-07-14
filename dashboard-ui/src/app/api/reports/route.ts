import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = userId;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    if (!classId) {
      return NextResponse.json({ error: "Class ID is required" }, { status: 400 });
    }

    // Kiểm tra quyền truy cập
    if (role === "teacher") {
      // Teacher chỉ có thể xem báo cáo lớp họ dạy hoặc là supervisor
      const hasPermission = await prisma.class.findFirst({
        where: {
          id: parseInt(classId),
          OR: [
            { supervisorId: currentUserId },
            { lessons: { some: { teacherId: currentUserId } } }
          ]
        }
      });

      if (!hasPermission) {
        return NextResponse.json({ error: "You don't have permission to view this class report" }, { status: 403 });
      }
    } else if (role !== "admin") {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Lấy dữ liệu báo cáo
    const classData = await prisma.class.findUnique({
      where: { id: parseInt(classId) },
      include: {
        students: {
          include: {
            parent: true,
            comments: {
              include: {
                teacher: true
              },
              orderBy: {
                date: 'desc'
              }
            }
          },
          orderBy: [
            { name: 'asc' },
            { surname: 'asc' }
          ]
        },
        grade: true
      }
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Format dữ liệu cho báo cáo
    const reportData = classData.students.map(student => {
      // Lấy nhận xét mới nhất của mỗi teacher
      const teacherComments = student.comments.reduce((acc, comment) => {
        if (!acc[comment.teacherId] || new Date(comment.date) > new Date(acc[comment.teacherId].date)) {
          acc[comment.teacherId] = comment;
        }
        return acc;
      }, {} as Record<string, any>);

      // Tạo danh sách nhận xét
      const comments = Object.values(teacherComments).map((comment: any) => ({
        teacherName: `${comment.teacher.name} ${comment.teacher.surname}`,
        content: comment.content,
        type: comment.type,
        date: comment.date
      }));

      return {
        studentId: student.id,
        studentName: `${student.name} ${student.surname}`,
        parentName: `${student.parent.name} ${student.parent.surname}`,
        parentPhone: student.parent.phone,
        parentEmail: student.parent.email,
        comments: comments
      };
    });

    return NextResponse.json({
      classInfo: {
        id: classData.id,
        name: classData.name,
        grade: classData.grade.level
      },
      students: reportData
    });

  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 