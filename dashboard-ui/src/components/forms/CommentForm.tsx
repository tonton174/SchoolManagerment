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
  teachers?: Array<{ id: string; name: string; surname: string }>;
  onSuccess?: () => void; // Callback để cập nhật state
  setOpen?: Dispatch<SetStateAction<boolean>>; // Để đóng modal
}

const CommentForm = ({ type, data, students, lessons, teachers, onSuccess, setOpen }: CommentFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { userId, sessionClaims } = useAuth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
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
    let finalData = { ...formData };
    if (role === "admin") {
      finalData.teacherId = formData.teacherId;
    } else {
      finalData.teacherId = userId || "";
    }

    startTransition(async () => {
      try {
        if (type === "create") {
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
              teacherId: finalData.teacherId,
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
    <form onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100 relative"
    >
      {/* Close button */}
      {setOpen && (
        <div className="absolute top-4 right-4">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-500 hover:text-white text-gray-500 transition-all shadow"
          aria-label="Close"
        >
          <span className="text-2xl leading-none">×</span>
        </button>
        </div>
      )}
      {/* Student Selection */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Student *
        </label>
        <select
          {...register("studentId")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">Select student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} {student.surname} - {student.class.name}
            </option>
          ))}
        </select>
        {errors.studentId && (
          <p className="text-red-500 text-xs mt-1 font-medium">{errors.studentId.message}</p>
        )}
      </div>

      {/* Nếu là admin thì cho chọn giáo viên */}
      {role === "admin" && teachers && teachers.length > 0 && (
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Teacher *
          </label>
          <select
            {...register("teacherId")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.teacherId && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.teacherId.message}</p>
          )}
        </div>
      )}

      {/* Lesson Selection (Optional) */}
      {lessons && lessons.length > 0 && (
        <div>
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Lesson (optional)
          </label>
          <select
            {...register("lessonId")}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">Select lesson</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.name} - {lesson.subject.name}
              </option>
            ))}
          </select>
          {errors.lessonId && (
            <p className="text-red-500 text-xs mt-1 font-medium">{errors.lessonId.message}</p>
          )}
        </div>
      )}

      {/* Comment Type */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Comment type *
        </label>
        <select
          {...register("type")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="POSITIVE">Positive</option>
          <option value="NEGATIVE">Negative</option>
          <option value="NEUTRAL">Neutral</option>
          <option value="SUGGESTION">Suggestion</option>
        </select>
        {errors.type && (
          <p className="text-red-500 text-xs mt-1 font-medium">{errors.type.message}</p>
        )}
      </div>

      {/* Comment Content */}
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">
          Comment content *
        </label>
        <textarea
          {...register("content")}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
          placeholder="Enter comment content..."
        />
        {errors.content && (
          <p className="text-red-500 text-xs mt-1 font-medium">{errors.content.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50"
        >
          {isPending ? "Processing..." : type === "create" ? "Add comment" : "Update comment"}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 