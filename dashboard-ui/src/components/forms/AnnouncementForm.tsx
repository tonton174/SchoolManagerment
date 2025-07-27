"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  announcementSchema,
  AnnouncementSchema,
} from "@/lib/formValidationSchemas";
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AnnouncementForm = ({
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
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: data || {
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      classId: undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Announcement form data:", data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Thông báo đã được ${type === "create" ? "tạo" : "cập nhật"} thành công!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData || { classes: [] };

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
        {type === "create" ? "Tạo thông báo mới" : "Cập nhật thông báo"}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Tiêu đề thông báo
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Nhập tiêu đề thông báo..."
            {...register("title")}
            defaultValue={data?.title}
          />
          {errors.title?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.title.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Nội dung thông báo
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px] resize-vertical"
            placeholder="Nhập nội dung thông báo..."
            {...register("description")}
            defaultValue={data?.description}
          />
          {errors.description?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.description.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Ngày thông báo
          </label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("date")}
            defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
          />
          {errors.date?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.date.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Lớp (tùy chọn)
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">Tất cả các lớp</option>
            {classes?.map((classItem: { id: number; name: string }) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.classId.message.toString()}
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
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50"
        >
          {type === "create" ? "Tạo thông báo" : "Cập nhật thông báo"}
        </button>
      </form>
    </div>
  );
};

export default AnnouncementForm; 