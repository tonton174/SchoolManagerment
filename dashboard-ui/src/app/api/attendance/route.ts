import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Lấy lịch sử điểm danh theo lessonId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get('lessonId');
  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 });
  }
  const attendance = await prisma.attendance.findMany({
    where: { lessonId: Number(lessonId) },
    include: { student: { select: { name: true, surname: true } } },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json({ attendance });
}

// Lưu điểm danh cho lesson
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, attendance } = body;
    if (!lessonId || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json({ error: 'Missing lessonId or attendance' }, { status: 400 });
    }
    // Xoá điểm danh cũ của lesson này trong ngày hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    await prisma.attendance.deleteMany({
      where: {
        lessonId: Number(lessonId),
        date: { gte: today, lt: tomorrow },
      },
    });
    // Lưu mới từng bản ghi
    const created = await Promise.all(
      attendance.map((a: { studentId: string; present: boolean }) =>
        prisma.attendance.create({
          data: {
            lessonId: Number(lessonId),
            studentId: a.studentId,
            present: a.present,
            date: new Date(),
          },
        })
      )
    );
    return NextResponse.json({ success: true, created });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 