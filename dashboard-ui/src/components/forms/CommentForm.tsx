"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema, type CommentSchema as CommentSchemaType } from "@/lib/formValidationSchemas";
import { useTransition } from "react";
import { toast } from "react-toastify";
import { useAuth } from "@clerk/nextjs";
import { Dispatch, SetStateAction } from "react";

interface CommentFormProps {
  type: "create" | "update";
  data?: CommentSchemaType;
  students: Array<{ id: string; name: string; surname: string; class: { name: string } }>;
  lessons?: Array<{ id: number; name: string; subject: { name: string } }>;
  onSuccess?: () => void; // Callback để cập nhật state
  setOpen?: Dispatch<SetStateAction<boolean>>; // Để đóng modal
}

const CommentForm = ({ type, data, students, lessons, onSuccess, setOpen }: CommentFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { userId } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CommentSchemaType>({
    resolver: zodResolver(commentSchema),
    defaultValues: data || {
      content: "",
      type: "NEUTRAL",
      studentId: "",
      lessonId: undefined,
      teacherId: userId || "",
    },
  });

  const onSubmit = (formData: CommentSchemaType) => {
    // Đảm bảo teacherId được set
    const finalData = {
      ...formData,
      teacherId: userId || "",
    };

    startTransition(async () => {
      try {
        if (type === "create") {
          // Sử dụng API route để tạo comment
          const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: finalData.content,
              type: finalData.type,
              studentId: finalData.studentId,
              lessonId: finalData.lessonId,
            }),
          });
          if (response.ok) {
            toast.success("Thêm nhận xét thành công!");
            reset();
            if (onSuccess) onSuccess();
            if (setOpen) setOpen(false);
          } else {
            const errorData = await response.json();
            toast.error(errorData.error || "Có lỗi xảy ra!");
          }
        } else if (type === "update") {
          // Sử dụng API route để cập nhật comment
          const response = await fetch('/api/comments', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: finalData.id,
              content: finalData.content,
              type: finalData.type,
              lessonId: finalData.lessonId,
            }),
          });
          if (response.ok) {
            toast.success("Cập nhật nhận xét thành công!");
            if (onSuccess) onSuccess();
            if (setOpen) setOpen(false);
          } else {
            const errorData = await response.json();
            toast.error(errorData.error || "Có lỗi xảy ra!");
          }
        }
      } catch (error) {
        console.error('Error creating/updating comment:', error);
        toast.error("Có lỗi xảy ra!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Student Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Học sinh *
        </label>
        <select
          {...register("studentId")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Chọn học sinh</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname} - {student.class.name}
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="text-red-500 text-sm mt-1">{errors.studentId.message}</p>
        )}
      </div>

      {/* Lesson Selection (Optional) */}
      {lessons && lessons.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bài học (tùy chọn)
          </label>
          <select
            {...register("lessonId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn bài học</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name} - {lesson.subject.name}
              </option>
            ))}
          </select>
          {errors.lessonId && (
            <p className="text-red-500 text-sm mt-1">{errors.lessonId.message}</p>
          )}
        </div>
      )}

      {/* Comment Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loại nhận xét *
        </label>
        <select
          {...register("type")}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="POSITIVE">Tích cực</option>
          <option value="NEGATIVE">Tiêu cực</option>
          <option value="NEUTRAL">Trung tính</option>
          <option value="SUGGESTION">Đề xuất</option>
        </select>
        {errors.type && (
          <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
        )}
      </div>

      {/* Comment Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nội dung nhận xét *
        </label>
        <textarea
          {...register("content")}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nhập nội dung nhận xét..."
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? "Đang xử lý..." : type === "create" ? "Thêm nhận xét" : "Cập nhật nhận xét"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 