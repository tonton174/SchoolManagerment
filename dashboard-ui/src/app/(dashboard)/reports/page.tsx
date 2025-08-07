"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

interface Class {
  id: number;
  name: string;
  grade: {
    level: number;
  };
}

interface ReportData {
  classInfo: {
    id: number;
    name: string;
    grade: number;
  };
  students: Array<{
    studentId: string;
    studentName: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    comments: Array<{
      teacherName: string;
      content: string;
      type: string;
      date: string;
    }>;
  }>;
}

const ReportsPage = () => {
  const { sessionClaims, userId } = useAuth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch classes based on user role
  const fetchClasses = async () => {
    try {
      let url = '/api/form-data?table=class&type=create';
      if (role === "teacher") {
        url += '&teacherId=' + userId;
      }
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // Fetch report data
  const fetchReport = async (classId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reports?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error fetching report data");
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error("Error fetching report data");
    }
    setLoading(false);
  };

  // Export to Excel
  const exportToExcel = async (classId: number) => {
    try {
      const response = await fetch(`/api/reports/export?classId=${classId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BaoCao_Lop${classId}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success("Report exported successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error exporting report");
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error("Error exporting report");
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [role, userId]);

  useEffect(() => {
    if (selectedClass) {
      fetchReport(selectedClass);
    }
  }, [selectedClass]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "bg-green-100 text-green-800";
      case "NEGATIVE":
        return "bg-red-100 text-red-800";
      case "SUGGESTION":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "POSITIVE":
        return "Positive";
      case "NEGATIVE":
        return "Negative";
      case "SUGGESTION":
        return "Suggestion";
      default:
        return "Neutral";
    }
  };

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Class Reports</h1>
        {selectedClass && (
          <button
            onClick={() => exportToExcel(selectedClass)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Image src="/plus.png" alt="Excel" width={16} height={16} />
            Export to Excel
          </button>
        )}
      </div>

      {/* Class Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Class
        </label>
        <select
          value={selectedClass || ""}
          onChange={(e) => setSelectedClass(Number(e.target.value) || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Choose a class</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              Class {cls.name} - Grade {cls.grade.level}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading report data...</div>
        </div>
      )}

      {/* Report Data */}
      {reportData && !loading && (
        <div className="space-y-6">
          {/* Class Info */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">
              Class {reportData.classInfo.name} - Grade {reportData.classInfo.grade}
            </h2>
            <p className="text-blue-600">
              Total Students: {reportData.students.length}
            </p>
          </div>

          {/* Students List */}
          <div className="space-y-4">
            {reportData.students.map((student, index) => (
              <div key={student.studentId} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {index + 1}. {student.studentName}
                    </h3>
                    <p className="text-gray-600">
                      Parent: {student.parentName} | Phone: {student.parentPhone}
                    </p>
                    {student.parentEmail && (
                      <p className="text-gray-600">Email: {student.parentEmail}</p>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Teacher Comments:</h4>
                  {student.comments.length > 0 ? (
                    <div className="space-y-2">
                      {student.comments.map((comment, commentIndex) => (
                        <div key={commentIndex} className="bg-gray-50 p-3 rounded-md">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-800">
                              {comment.teacherName}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(comment.type)}`}>
                              {getTypeText(comment.type)}
                            </span>
                          </div>
                          <p className="text-gray-700">{comment.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(comment.date).toLocaleDateString('en-US')}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No comments yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Data */}
      {!selectedClass && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Image src="/comment.jpg" alt="Report" width={64} height={64} className="mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">No Class Selected</h3>
          <p className="text-gray-500">Please select a class to view the report</p>
        </div>
      )}
    </div>
  );
};

export default ReportsPage; 