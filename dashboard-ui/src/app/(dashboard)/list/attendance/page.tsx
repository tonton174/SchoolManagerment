import AttendanceForm from '@/components/forms/AttendanceForm';
import prisma from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { notFound } from 'next/navigation';
import AttendanceDashboard from '@/components/AttendanceDashboard';

export default async function AttendancePage() {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Lấy ngày hôm nay (00:00:00)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (role === 'student') {
    // Student chỉ xem lịch sử điểm danh của mình
    const history = await prisma.attendance.findMany({
      where: { studentId: userId! },
      include: { lesson: { select: { name: true, class: { select: { name: true } } } } },
      orderBy: { date: 'desc' },
    });
    return (
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <h1 className="text-xl font-semibold mb-4">Attendance History</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Lesson</th>
                <th className="px-4 py-2 border">Class</th>
                <th className="px-4 py-2 border">Present</th>
                <th className="px-4 py-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-2 border">{a.lesson?.name}</td>
                  <td className="px-4 py-2 border">{a.lesson?.class?.name}</td>
                  <td className="px-4 py-2 border">{a.present ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 border">{new Date(a.date).toLocaleString()}</td>
                </tr>
              ))}
              {!history.length && (
                <tr><td colSpan={4} className="text-center text-gray-400 py-4">No attendance history yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Teacher/Admin: Lấy các lớp mà họ có quyền quản lý
  let classes = [];
  
  if (role === 'teacher') {
    // Lấy các lớp mà giáo viên phụ trách hoặc dạy
    classes = await prisma.class.findMany({
      where: {
        OR: [
          { supervisorId: userId! },
          { lessons: { some: { teacherId: userId! } } }
        ]
      },
      include: { students: { select: { id: true, name: true, surname: true } } },
      orderBy: { name: 'asc' }
    });
  } else if (role === 'admin') {
    // Admin có thể xem tất cả lớp
    classes = await prisma.class.findMany({
      include: { students: { select: { id: true, name: true, surname: true } } },
      orderBy: { name: 'asc' }
    });
  } else {
    return notFound();
  }

  // Lấy tất cả lịch sử điểm danh (chỉ điểm danh tự do, không qua lesson)
  const allAttendanceRaw = await prisma.attendance.findMany({
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

  // Filter chỉ lấy điểm danh tự do (không có lessonId)
  const allAttendance = allAttendanceRaw.filter(attendance => attendance.lessonId === null);

  return (
    <AttendanceDashboard
      classes={classes}
      allAttendance={allAttendance}
    />
  );
} 