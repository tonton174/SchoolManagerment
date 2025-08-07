"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  assignmentSchema,
  AssignmentSchema,
} from "@/lib/formValidationSchemas";
import {
  createAssignment,
  updateAssignment,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AssignmentForm = ({
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignmentSchema>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: data || {
      title: "",
      startDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days later
      lessonId: undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Assignment form data:", data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Bài tập đã được ${type === "create" ? "tạo" : "cập nhật"} thành công!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { lessons } = relatedData || { lessons: [] };

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
        {type === "create" ? "Tạo bài tập mới" : "Cập nhật bài tập"}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Tiêu đề bài tập
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Nhập tiêu đề bài tập..."
            {...register("title")}
            defaultValue={data?.title}
          />
          {errors.title?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.title.message.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              {...register("startDate")}
              defaultValue={data?.startDate ? new Date(data.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
            />
            {errors.startDate?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.startDate.message.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Ngày hạn nộp
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              {...register("dueDate")}
              defaultValue={data?.dueDate ? new Date(data.dueDate).toISOString().split('T')[0] : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
            />
            {errors.dueDate?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.dueDate.message.toString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Bài học
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("lessonId")}
            defaultValue={data?.lessonId || ""}
          >
            <option value="">Chọn bài học</option>
            {lessons?.map((lesson: { id: number; name: string; subject: { name: string }; class: { name: string } }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} - {lesson.subject.name} - {lesson.class.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.lessonId.message.toString()}
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
          className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-lg font-semibold shadow hover:from-orange-600 hover:to-orange-800 transition-all disabled:opacity-50"
        >
          {type === "create" ? "Tạo bài tập" : "Cập nhật bài tập"}
        </button>
      </form>
    </div>
  );
};

export default AssignmentForm; 