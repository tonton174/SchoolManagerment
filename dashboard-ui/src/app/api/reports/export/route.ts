import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import * as XLSX from 'xlsx';

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
        return NextResponse.json({ error: "You don't have permission to export this class report" }, { status: 403 });
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

    // Tạo dữ liệu cho Excel
    const excelData = classData.students.map((student, index) => {
      // Lấy nhận xét mới nhất của mỗi teacher
      const teacherComments = student.comments.reduce((acc, comment) => {
        if (!acc[comment.teacherId] || new Date(comment.date) > new Date(acc[comment.teacherId].date)) {
          acc[comment.teacherId] = comment;
        }
        return acc;
      }, {} as Record<string, any>);

      // Tạo chuỗi nhận xét
      const commentsText = Object.values(teacherComments)
        .map((comment: any) => comment.content)
        .join('; ');

      return {
        'Số điện thoại phụ huynh': student.parent.phone || 'Chưa có thông tin',
        'STT': index + 1,
        'Họ và tên học sinh': `${student.name} ${student.surname}`,
        'Họ và tên phụ huynh': `${student.parent.name} ${student.parent.surname}`,
        'Email phụ huynh': student.parent.email || '',
        'Nhận xét của giáo viên': commentsText || 'Chưa có nhận xét'
      };
    });

    // Tạo workbook và worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Đặt tên cho worksheet
    XLSX.utils.book_append_sheet(workbook, worksheet, `Lớp ${classData.name}`);

    // Tạo buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Tạo tên file
    const fileName = `BaoCao_Lop${classData.name}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Trả về file Excel
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 