"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface AttendanceFormProps {
  lessons: Array<{ id: number; name: string; class: { name: string; students: { id: string; name: string; surname: string }[] } }>;
  students: Array<{ id: string; name: string; surname: string }>;
  onSuccess?: () => void;
  setOpen?: (open: boolean) => void;
}

const AttendanceForm = ({ lessons, students: initialStudents, onSuccess, setOpen }: AttendanceFormProps) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      lessonId: lessons[0]?.id || "",
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number>(lessons[0]?.id || "");
  const [students, setStudents] = useState(initialStudents);
  const [attendance, setAttendance] = useState<{ studentId: string; present: boolean }[]>(
    initialStudents.map(s => ({ studentId: s.id, present: true }))
  );
  const [history, setHistory] = useState<any[]>([]);

  // Load students & history khi chọn lesson
  useEffect(() => {
    const lesson = lessons.find(l => l.id === Number(selectedLessonId));
    if (lesson) {
      setStudents(lesson.class.students);
      // Fetch lịch sử điểm danh của lesson này
      fetch(`/api/attendance?lessonId=${lesson.id}`)
        .then(res => res.json())
        .then(data => {
          setHistory(data.attendance || []);
          // Nếu đã có điểm danh, set lại trạng thái
          if (data.attendance && data.attendance.length > 0) {
            setAttendance(
              lesson.class.students.map(s => {
                const found = data.attendance.find((a: any) => a.studentId === s.id);
                return { studentId: s.id, present: found ? found.present : true };
              })
            );
          } else {
            setAttendance(lesson.class.students.map(s => ({ studentId: s.id, present: true })));
          }
        });
    }
  }, [selectedLessonId, lessons]);

  // Chọn tất cả / Bỏ chọn tất cả
  const setAll = (present: boolean) => {
    setAttendance(students.map(s => ({ studentId: s.id, present })));
  };

  const onChangeTick = (studentId: string, present: boolean) => {
    setAttendance(prev => prev.map(a => a.studentId === studentId ? { ...a, present } : a));
  };

  const onSubmit = async (formData: any) => {
    setIsPending(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: selectedLessonId,
          attendance,
        }),
      });
      if (response.ok) {
        toast.success("Attendance saved!");
        if (onSuccess) onSuccess();
        if (setOpen) setOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error!");
      }
    } catch (error) {
      toast.error("Error!");
    } finally {
      setIsPending(false);
    }
  };

  const presentCount = attendance.filter(a => a.present).length;
  const absentCount = attendance.length - presentCount;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100 relative">
      {/* Close button */}
      {setOpen && (
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 transition-all shadow"
            aria-label="Close"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
      )}
      <h1 className="text-xl font-semibold mb-4">Attendance</h1>
      <div>
        <label className="text-xs text-gray-500 mb-2">Lesson</label>
        <select
          {...register("lessonId")}
          value={selectedLessonId}
          onChange={e => setSelectedLessonId(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          {lessons.map(lesson => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.name} - {lesson.class.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-4 mb-2">
        <button type="button" onClick={() => setAll(true)} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs">Mark all present</button>
        <button type="button" onClick={() => setAll(false)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs">Mark all absent</button>
        <span className="ml-auto text-xs text-gray-500">Present: {presentCount} / {attendance.length} | Absent: {absentCount}</span>
      </div>
      <div>
        <label className="text-xs text-gray-500 mb-2 block">Students</label>
        <div className="max-h-64 overflow-y-auto border rounded-lg divide-y">
          {students.map(student => {
            const checked = attendance.find(a => a.studentId === student.id)?.present;
            return (
              <div key={student.id} className="flex items-center justify-between px-4 py-2">
                <span>{student.name} {student.surname}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={e => onChangeTick(student.id, e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-500">Present</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save Attendance"}
        </button>
      </div>
      {/* Lịch sử điểm danh của lesson này */}
      {history.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-semibold mb-2">Attendance History</h2>
          <div className="max-h-40 overflow-y-auto border rounded-lg divide-y text-xs">
            {history.map((a, idx) => (
              <div key={a.id || idx} className="flex items-center justify-between px-4 py-2">
                <span>{a.student?.name} {a.student?.surname}</span>
                <span className={a.present ? "text-green-600" : "text-red-600"}>{a.present ? "Present" : "Absent"}</span>
                <span className="text-gray-400">{new Date(a.date).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default AttendanceForm; 