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

    // Lấy comments từ database
    let comments;
    
    try {
      const whereClause: any = {};
      
      // Filter theo role
      if (role === "teacher") {
        whereClause.teacherId = currentUserId;
      } else if (role === "student") {
        whereClause.studentId = currentUserId;
      }
      // Admin và parent có thể thấy tất cả

      comments = await prisma.comment.findMany({
        where: whereClause,
        include: {
          student: {
            include: { class: true }
          },
          teacher: true,
          lesson: {
            include: { subject: true }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });
    } catch (dbError) {
      console.log("Database error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, type, studentId, lessonId } = body;
    let teacherId = userId;
    if (role === "admin") {
      teacherId = body.teacherId;
      if (!teacherId) {
        return NextResponse.json({ error: "Missing teacherId for admin" }, { status: 400 });
      }
      // Kiểm tra teacherId có tồn tại không
      const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
      if (!teacher) {
        return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
      }
    }

    // Validate required fields
    if (!content || !type || !studentId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Kiểm tra quyền comment cho student
    if (role === "teacher") {
      // Kiểm tra xem teacher có quyền comment cho student này không
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { class: true }
      });

      if (!student) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }

      // Kiểm tra xem teacher có dạy lớp này hoặc là supervisor không
      const hasPermission = await prisma.class.findFirst({
        where: {
          id: student.classId,
          OR: [
            { supervisorId: userId }, // Là supervisor của lớp
            { 
              lessons: { 
                some: { 
                  teacherId: userId 
                } 
              } 
            } // Dạy lesson trong lớp này
          ]
        }
      });

      if (!hasPermission) {
        return NextResponse.json({ error: "You don't have permission to comment on this student" }, { status: 403 });
      }
    } else if (role !== "admin") {
      // Chỉ admin và teacher mới có quyền tạo comment
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }

    // Lưu vào database
    const newComment = await prisma.comment.create({
      data: {
        content,
        type,
        teacherId,
        studentId,
        lessonId: lessonId || null,
      },
      include: {
        student: {
          include: { class: true }
        },
        teacher: true,
        lesson: {
          include: { subject: true }
        }
      }
    });

    return NextResponse.json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const body = await request.json();
    const { id, content, type, lessonId } = body;
    if (!id || !content || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Chỉ cho phép giáo viên sửa comment của mình hoặc admin sửa bất kỳ comment nào
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (role !== "admin" && comment.teacherId !== userId) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    
    const updated = await prisma.comment.update({
      where: { id },
      data: { content, type, lessonId: lessonId || null }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    
    // Chỉ cho phép giáo viên xóa comment của mình hoặc admin xóa bất kỳ comment nào
    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }
    if (role !== "admin" && comment.teacherId !== userId) {
      return NextResponse.json({ error: "Permission denied" }, { status: 403 });
    }
    
    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 