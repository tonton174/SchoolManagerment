"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  eventSchema,
  EventSchema,
} from "@/lib/formValidationSchemas";
import {
  createEvent,
  updateEvent,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EventForm = ({
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
    watch,
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
    defaultValues: data || {
      title: "",
      description: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16), // 1 hour later
      classId: undefined,
    },
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log("Event form data:", data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Sự kiện đã được ${type === "create" ? "tạo" : "cập nhật"} thành công!`);
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
        {type === "create" ? "Tạo sự kiện mới" : "Cập nhật sự kiện"}
      </h2>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="block text-base font-semibold text-gray-800 mb-2">
            Tiêu đề sự kiện
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Nhập tiêu đề sự kiện..."
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
            Mô tả sự kiện
          </label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[120px] resize-vertical"
            placeholder="Nhập mô tả sự kiện..."
            {...register("description")}
            defaultValue={data?.description}
          />
          {errors.description?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.description.message.toString()}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Thời gian bắt đầu
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              {...register("startTime")}
              defaultValue={data?.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)}
            />
            {errors.startTime?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.startTime.message.toString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-base font-semibold text-gray-800 mb-2">
              Thời gian kết thúc
            </label>
            <input
              type="datetime-local"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              {...register("endTime")}
              defaultValue={data?.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
            />
            {errors.endTime?.message && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.endTime.message.toString()}
              </p>
            )}
          </div>
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
          className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg font-semibold shadow hover:from-green-600 hover:to-green-800 transition-all disabled:opacity-50"
        >
          {type === "create" ? "Tạo sự kiện" : "Cập nhật sự kiện"}
        </button>
      </form>
    </div>
  );
};

export default EventForm; 