"use client";
import { useState, useEffect } from "react";
import AttendanceFormNew from "./forms/AttendanceFormNew";

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return d.toLocaleString();
}

export default function AttendanceDashboard({ classes, allAttendance }: {
  classes: Array<{ id: number; name: string; students: Array<{ id: string; name: string; surname: string }> }>;
  allAttendance: any[];
}) {
  const [showNewAttendanceForm, setShowNewAttendanceForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{classId: number, date: string} | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Nhóm điểm danh theo lớp và ngày
  const groupedAttendance = allAttendance.reduce((acc: any, attendance: any) => {
    const classId = attendance.student.class.id;
    const date = new Date(attendance.date).toISOString().split('T')[0];
    const key = `${classId}-${date}`;
    
    if (!acc[key]) {
      acc[key] = {
        classId,
        className: attendance.student.class.name,
        date,
        attendances: []
      };
    }
    acc[key].attendances.push(attendance);
    return acc;
  }, {});

  const groupedArray = Object.values(groupedAttendance).sort((a: any, b: any) => {
    // Sắp xếp theo ngày mới nhất trước
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (!mounted) return null;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Điểm danh</h1>
        <button
          type="button"
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
          onClick={() => {
            setShowNewAttendanceForm(true);
            setSelectedGroup(null);
          }}
        >
          Tạo điểm danh mới
        </button>
      </div>
      {/* Hiển thị danh sách lớp và ngày điểm danh - mặc định hiển thị */}
      {!showNewAttendanceForm && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Lịch sử điểm danh theo lớp và ngày</h2>
          <div className="grid gap-4">
            {groupedArray.map((group: any) => {
              const presentCount = group.attendances.filter((a: any) => a.present).length;
              const totalCount = group.attendances.length;
              const isSelected = selectedGroup?.classId === group.classId && selectedGroup?.date === group.date;
              
              return (
                <div key={`${group.classId}-${group.date}`} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg">{group.className}</h3>
                      <p className="text-gray-600">
                        Ngày: {new Date(group.date).toLocaleDateString('vi-VN')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Có mặt: {presentCount}/{totalCount} học sinh
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
                      onClick={() => {
                        setSelectedGroup(isSelected ? null : { classId: group.classId, date: group.date });
                      }}
                    >
                      {isSelected ? 'Ẩn chi tiết' : 'Xem chi tiết'}
                    </button>
                  </div>
                  
                  {/* Chi tiết điểm danh */}
                  {isSelected && (
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2">Chi tiết điểm danh:</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-4 py-2 border">Học sinh</th>
                              <th className="px-4 py-2 border">Trạng thái</th>
                              <th className="px-4 py-2 border">Thời gian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.attendances.map((attendance: any) => (
                              <tr key={attendance.id}>
                                <td className="px-4 py-2 border">{attendance.student.name} {attendance.student.surname}</td>
                                <td className="px-4 py-2 border">
                                  <span className={attendance.present ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                                    {attendance.present ? 'Có mặt' : 'Vắng mặt'}
                                  </span>
                                </td>
                                <td className="px-4 py-2 border">{formatDate(attendance.date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {groupedArray.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                Chưa có lịch sử điểm danh nào.
              </div>
            )}
          </div>
        </div>
      )}
      {/* Hiện form điểm danh mới */}
      {showNewAttendanceForm && (
        <div className="mb-8">
          <AttendanceFormNew
            classes={classes}
            onSuccess={() => {
              setShowNewAttendanceForm(false);
              window.location.reload();
            }}
            setOpen={(open) => !open && setShowNewAttendanceForm(false)}
          />
        </div>
      )}
    </div>
  );
} 