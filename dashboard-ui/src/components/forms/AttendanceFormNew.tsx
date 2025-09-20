"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface Class {
  id: number;
  name: string;
  students: Array<{ id: string; name: string; surname: string }>;
}

interface AttendanceFormNewProps {
  classes: Class[];
  onSuccess?: () => void;
  setOpen?: (open: boolean) => void;
}

const AttendanceFormNew = ({ classes, onSuccess, setOpen }: AttendanceFormNewProps) => {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      classId: "",
      date: new Date().toISOString().split('T')[0], // Ngày hôm nay
    },
  });

  const [isPending, setIsPending] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Array<{ id: string; name: string; surname: string }>>([]);
  const [attendance, setAttendance] = useState<{ studentId: string; present: boolean }[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  // Load students khi chọn lớp
  useEffect(() => {
    if (!selectedClassId) {
      setStudents([]);
      setAttendance([]);
      return;
    }
    
    const selectedClass = classes.find(c => c.id === selectedClassId);
    if (selectedClass) {
      setStudents(selectedClass.students);
      setAttendance(selectedClass.students.map(s => ({ studentId: s.id, present: true })));
    }
  }, [selectedClassId, classes]);

  // Load lịch sử điểm danh khi chọn lớp và ngày
  useEffect(() => {
    if (!selectedClassId || !selectedDate) return;
    
    fetch(`/api/attendance?classId=${selectedClassId}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.attendance || []);
        // Nếu đã có điểm danh, set lại trạng thái
        if (data.attendance && data.attendance.length > 0) {
          setAttendance(
            students.map(s => {
              const found = data.attendance.find((a: any) => a.studentId === s.id);
              return { studentId: s.id, present: found ? found.present : true };
            })
          );
        } else {
          setAttendance(students.map(s => ({ studentId: s.id, present: true })));
        }
      })
      .catch(error => {
        console.error("Error fetching attendance history:", error);
        setHistory([]);
        setAttendance(students.map(s => ({ studentId: s.id, present: true })));
      });
  }, [selectedClassId, selectedDate, students]);

  // Chọn tất cả / Bỏ chọn tất cả
  const setAll = (present: boolean) => {
    setAttendance(students.map(s => ({ studentId: s.id, present })));
  };

  const onChangeTick = (studentId: string, present: boolean) => {
    setAttendance(prev => prev.map(a => a.studentId === studentId ? { ...a, present } : a));
  };

  const onSubmit = async (formData: any) => {
    if (!selectedClassId) {
      toast.error("Vui lòng chọn lớp!");
      return;
    }
    
    if (!selectedDate) {
      toast.error("Vui lòng chọn ngày!");
      return;
    }
    
    if (attendance.length === 0) {
      toast.error("Không có học sinh nào để điểm danh!");
      return;
    }
    
    setIsPending(true);
    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClassId,
          date: selectedDate,
          attendance,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || "Điểm danh đã được lưu!");
        if (onSuccess) onSuccess();
        if (setOpen) setOpen(false);
      } else {
        toast.error(result.error || "Có lỗi xảy ra!");
        console.error("Attendance error:", result);
      }
    } catch (error) {
      console.error("Attendance error:", error);
      toast.error("Có lỗi xảy ra khi lưu điểm danh!");
    } finally {
      setIsPending(false);
    }
  };

  const presentCount = attendance.filter(a => a.present).length;
  const absentCount = attendance.length - presentCount;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100 relative">
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
      
      <h1 className="text-xl font-semibold mb-4">Điểm danh</h1>
      
      {/* Chọn lớp */}
      <div>
        <label className="text-xs text-gray-500 mb-2">Lớp học</label>
        <select
          {...register("classId")}
          value={selectedClassId || ""}
          onChange={e => setSelectedClassId(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">-- Chọn lớp --</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>
      </div>

      {/* Chọn ngày */}
      <div>
        <label className="text-xs text-gray-500 mb-2">Ngày điểm danh</label>
        <input
          type="date"
          {...register("date")}
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Chỉ hiển thị form điểm danh khi đã chọn lớp */}
      {selectedClassId && students.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-2">
            <button type="button" onClick={() => setAll(true)} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs">Chọn tất cả có mặt</button>
            <button type="button" onClick={() => setAll(false)} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs">Chọn tất cả vắng mặt</button>
            <span className="ml-auto text-xs text-gray-500">Có mặt: {presentCount} / {attendance.length} | Vắng mặt: {absentCount}</span>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Học sinh</label>
            <div className="max-h-64 overflow-y-auto border rounded-lg">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học sinh</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Có mặt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map(student => {
                    const checked = attendance.find(a => a.studentId === student.id)?.present;
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className="text-sm font-medium text-gray-900">{student.name} {student.surname}</span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={e => onChangeTick(student.id, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50"
            >
              {isPending ? "Đang lưu..." : "Lưu điểm danh"}
            </button>
          </div>
        </>
      )}

      {/* Lịch sử điểm danh của lớp và ngày đã chọn */}
      {history.length > 0 && selectedClassId && selectedDate && (
        <div className="mt-6">
          <h2 className="text-base font-semibold mb-2">Lịch sử điểm danh - {classes.find(c => c.id === selectedClassId)?.name} - {new Date(selectedDate).toLocaleDateString('vi-VN')}</h2>
          <div className="max-h-40 overflow-y-auto border rounded-lg divide-y text-xs">
            {history.map((a, idx) => (
              <div key={a.id || idx} className="flex items-center justify-between px-4 py-2">
                <span>{a.student?.name} {a.student?.surname}</span>
                <span className={a.present ? "text-green-600" : "text-red-600"}>{a.present ? "Có mặt" : "Vắng mặt"}</span>
                <span className="text-gray-400">{new Date(a.date).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </form>
  );
};

export default AttendanceFormNew;