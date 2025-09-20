import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Lấy lịch sử điểm danh theo lessonId hoặc classId + date
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');
  const classId = searchParams.get('classId');
  const date = searchParams.get('date');

  let whereClause: any = {};

  if (lessonId) {
    // Lấy theo lessonId (logic cũ)
    whereClause.lessonId = Number(lessonId);
  } else if (classId && date) {
    // Lấy theo classId và date (logic mới)
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);
    
    whereClause = {
      student: { classId: Number(classId) },
      date: { gte: targetDate, lt: nextDay }
    };
  } else {
    return NextResponse.json({ error: 'Missing lessonId or (classId and date)' }, { status: 400 });
  }

  const attendance = await prisma.attendance.findMany({
    where: whereClause,
    include: { 
      student: { 
        select: { 
          name: true, 
          surname: true,
          class: { select: { name: true } }
        } 
      } 
    },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ attendance });
}

// Lưu điểm danh cho lesson hoặc class + date
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, classId, date, attendance } = body;
    
    if (!attendance || !Array.isArray(attendance)) {
      return NextResponse.json({ error: 'Missing attendance data' }, { status: 400 });
    }

    let whereClause: any = {};
    let attendanceDate: Date;

    if (lessonId) {
      // Logic cũ: điểm danh theo lesson
      const lesson = await prisma.lesson.findUnique({
        where: { id: Number(lessonId) },
        include: { class: { select: { students: { select: { id: true } } } } }
      });

      if (!lesson) {
        return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
      }

      whereClause = { lessonId: Number(lessonId) };
      attendanceDate = new Date();
    } else if (classId && date) {
      // Logic mới: điểm danh theo class và date
      const targetClass = await prisma.class.findUnique({
        where: { id: Number(classId) },
        include: { students: { select: { id: true } } }
      });

      if (!targetClass) {
        return NextResponse.json({ error: 'Class not found' }, { status: 404 });
      }

      attendanceDate = new Date(date);
      whereClause = {
        student: { classId: Number(classId) },
        date: {
          gte: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate()),
          lt: new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), attendanceDate.getDate() + 1)
        }
      };
    } else {
      return NextResponse.json({ error: 'Missing lessonId or (classId and date)' }, { status: 400 });
    }

    // Xoá điểm danh cũ
    await prisma.attendance.deleteMany({
      where: whereClause,
    });

    // Lưu mới từng bản ghi
    const created = await Promise.all(
      attendance.map((a: { studentId: string; present: boolean }) => {
        const data: any = {
          studentId: a.studentId,
          present: a.present,
          date: attendanceDate,
        };
        
        if (lessonId) {
          data.lessonId = Number(lessonId);
        }
        
        return prisma.attendance.create({ data });
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      created: created.length,
      message: `Attendance saved for ${created.length} students`
    });
  } catch (error) {
    console.error('Attendance API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 