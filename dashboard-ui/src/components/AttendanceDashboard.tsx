"use client";
import { useState, useEffect } from "react";
import AttendanceForm from "./forms/AttendanceForm";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleString();
}

export default function AttendanceDashboard({ lessons, attendanceByLesson, todayLessons }: {
  lessons: any[];
  attendanceByLesson: Record<number, any[]>;
  todayLessons: any[];
}) {
  const [viewLessonId, setViewLessonId] = useState<number|null>(null);
  const [attendanceLessonId, setAttendanceLessonId] = useState<number|null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-xl font-semibold mb-4">Lessons</h1>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Lesson</th>
              <th className="px-4 py-2 border">Class</th>
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => {
              const isToday = todayLessons.some(l => l.id === lesson.id);
              return (
                <tr key={lesson.id}>
                  <td className="px-4 py-2 border">{lesson.name}</td>
                  <td className="px-4 py-2 border">{lesson.class?.name}</td>
                  <td className="px-4 py-2 border">{formatDate(lesson.startTime)}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
                      onClick={() => {
                        setViewLessonId(lesson.id);
                        setAttendanceLessonId(null);
                      }}
                    >
                      View
                    </button>
                    {isToday && (
                      <button
                        type="button"
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                        onClick={() => {
                          setAttendanceLessonId(lesson.id);
                          setViewLessonId(null);
                        }}
                      >
                        Take Attendance
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!lessons.length && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-4">No lessons found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Xem lịch sử điểm danh của lesson đã chọn */}
      {viewLessonId && (
        (() => {
          const history = attendanceByLesson[viewLessonId] || [];
          const lesson = lessons.find(l => l.id === viewLessonId);
          return (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">Attendance History for {lesson?.name} - {lesson?.class?.name}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 border">Student</th>
                      <th className="px-4 py-2 border">Present</th>
                      <th className="px-4 py-2 border">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((a: any) => (
                      <tr key={a.id}>
                        <td className="px-4 py-2 border">{a.student?.name} {a.student?.surname}</td>
                        <td className="px-4 py-2 border">{a.present ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2 border">{formatDate(a.date)}</td>
                      </tr>
                    ))}
                    {!history.length && (
                      <tr><td colSpan={3} className="text-center text-gray-400 py-4">No attendance history yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()
      )}
      {/* Hiện form điểm danh khi chọn lesson hôm nay */}
      {attendanceLessonId && (() => {
        const lesson = lessons.find(l => l.id === attendanceLessonId);
        if (!lesson) return null;
        return (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-2">Take Attendance for {lesson.name} - {lesson.class?.name}</h2>
            <AttendanceForm lessons={[lesson]} students={lesson.class.students} />
          </div>
        );
      })()}
    </div>
  );
} 