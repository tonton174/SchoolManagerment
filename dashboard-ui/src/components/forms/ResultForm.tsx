"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  resultSchema,
  ResultSchema,
} from "@/lib/formValidationSchemas";
import {
  createResult,
  updateResult,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ResultForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  // Xác định loại đánh giá dựa trên dữ liệu
  const getAssessmentType = (data: any) => {
    if (data?.examId) return "exam";
    if (data?.assignmentId) return "assignment";
    return "exam"; // default
  };

  const [assessmentType, setAssessmentType] = useState<"exam" | "assignment">(
    getAssessmentType(data)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ResultSchema>({
    resolver: zodResolver(resultSchema),
    defaultValues: data || {
      score: 0,
      examId: undefined,
      assignmentId: undefined,
      studentId: "",
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createResult : updateResult,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Result form data:", data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Kết quả đã được ${type === "create" ? "tạo" : "cập nhật"} thành công!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { students, exams, assignments } = relatedData || { 
    students: [], 
    exams: [], 
    assignments: [] 
  };

  // Reset examId/assignmentId when assessment type changes
  useEffect(() => {
    if (assessmentType === "exam") {
      setValue("assignmentId", undefined);
    } else {
      setValue("examId", undefined);
    }
  }, [assessmentType, setValue]);

  // Khi update, disable việc thay đổi student và assessment
  const isUpdate = type === "update";

  return (
    <div className="relative bg-white p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
      >
        ×
      </button>
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {type === "create" ? "Tạo kết quả mới" : "Cập nhật kết quả"}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Học sinh
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("studentId")}
            defaultValue={data?.studentId || ""}
            disabled={isUpdate}
          >
            <option value="">Chọn học sinh</option>
            {students?.map((student: { id: string; name: string; surname: string }) => (
              <option value={student.id} key={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        {!isUpdate && (
          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Loại đánh giá
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="exam"
                  checked={assessmentType === "exam"}
                  onChange={(e) => setAssessmentType(e.target.value as "exam")}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Bài thi</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="assignment"
                  checked={assessmentType === "assignment"}
                  onChange={(e) => setAssessmentType(e.target.value as "assignment")}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Bài tập</span>
              </label>
            </div>
          </div>
        )}

        {assessmentType === "exam" && (
          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Bài thi
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              {...register("examId")}
              defaultValue={data?.examId || ""}
              disabled={isUpdate}
            >
              <option value="">Chọn bài thi</option>
              {exams?.map((exam: { id: number; title: string }) => (
                <option value={exam.id} key={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            {errors.examId?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.examId.message.toString()}
              </p>
            )}
          </div>
        )}

        {assessmentType === "assignment" && (
          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Bài tập
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              {...register("assignmentId")}
              defaultValue={data?.assignmentId || ""}
              disabled={isUpdate}
            >
              <option value="">Chọn bài tập</option>
              {assignments?.map((assignment: { id: number; title: string }) => (
                <option value={assignment.id} key={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
            {errors.assignmentId?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.assignmentId.message.toString()}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Điểm số
          </label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Nhập điểm (0-100)"
            {...register("score")}
            defaultValue={data?.score || 0}
          />
          {errors.score?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.score.message.toString()}
            </p>
          )}
        </div>

        {state.error && (
          <span className="text-red-500 text-xs mt-1 font-medium">
            Có lỗi xảy ra! Vui lòng thử lại.
          </span>
        )}

        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-700 text-white rounded-lg font-semibold shadow hover:from-purple-600 hover:to-purple-800 transition-all disabled:opacity-50"
        >
          {type === "create" ? "Tạo kết quả" : "Cập nhật kết quả"}
        </button>
      </form>
    </div>
  );
};

export default ResultForm; 