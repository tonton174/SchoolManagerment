"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchemas";
import { useFormState } from "react-dom";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

type TeacherFormState =
  | { success: boolean; error: boolean }
  | { success: boolean; error: { errors?: any[]; message?: string } };

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>();
  const [pendingData, setPendingData] = useState<any>(null);

  const [state, formAction] = useFormState<TeacherFormState>(
    async (prevState) => {
      if (!pendingData) return prevState;
      return await (type === "create" ? createTeacher : updateTeacher)(prevState as any, pendingData);
    },
    { success: false, error: false }
  );

  const onSubmit = handleSubmit((data) => {
    setPendingData({ ...data, img: img?.secure_url });
    formAction();
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  // Lấy lỗi chi tiết nếu có
  let errorMessage = "";
  const errorObj = (state as TeacherFormState).error;
  if (
    errorObj &&
    typeof errorObj === "object" &&
    errorObj !== null &&
    !Array.isArray(errorObj) &&
    (errorObj as any).errors &&
    Array.isArray((errorObj as any).errors) &&
    (errorObj as any).errors.length > 0
  ) {
    errorMessage = (errorObj as any).errors
      .map((e: any) => {
        const msg = (e.message || e.longMessage || "").toLowerCase();
        if (msg.includes("breached password")) {
          return "Mật khẩu này đã từng bị rò rỉ trên internet. Bạn nên chọn mật khẩu khác để bảo mật hơn.";
        }
        if (msg.includes("username") && msg.includes("unique")) {
          return "Username đã được sử dụng.";
        }
        if (msg.includes("email") && msg.includes("unique")) {
          return "Email đã được sử dụng.";
        }
        if (msg.includes("phone") && msg.includes("unique")) {
          return "Số điện thoại đã được sử dụng.";
        }
        return e.message || e.longMessage;
      })
      .join("; ");
  } else if (typeof errorObj === "string") {
    const msg = (errorObj as string).toLowerCase();
    if (msg.includes("username") && msg.includes("unique")) {
      errorMessage = "Username đã được sử dụng.";
    } else if (msg.includes("email") && msg.includes("unique")) {
      errorMessage = "Email đã được sử dụng.";
    } else if (msg.includes("phone") && msg.includes("unique")) {
      errorMessage = "Số điện thoại đã được sử dụng.";
    } else {
      errorMessage = errorObj as string;
    }
  } else if (
    errorObj &&
    typeof errorObj === "object" &&
    errorObj !== null &&
    !Array.isArray(errorObj) &&
    (errorObj as any).message
  ) {
    const msg = (errorObj as any).message.toLowerCase();
    if (msg.includes("username") && msg.includes("unique")) {
      errorMessage = "Username đã được sử dụng.";
    } else if (msg.includes("email") && msg.includes("unique")) {
      errorMessage = "Email đã được sử dụng.";
    } else if (msg.includes("phone") && msg.includes("unique")) {
      errorMessage = "Số điện thoại đã được sử dụng.";
    } else if (msg.includes("breached password")) {
      errorMessage = "Mật khẩu này đã từng bị rò rỉ trên internet. Bạn nên chọn mật khẩu khác để bảo mật hơn.";
    } else {
      errorMessage = (errorObj as any).message;
    }
  } else if (errorObj) {
    errorMessage = "Something went wrong!";
  }

  console.log("STATE ERROR:", state.error);

  const { subjects } = relatedData;

  return (
    <form className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100 relative" onSubmit={onSubmit}>
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
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          defaultValue={data?.password}
          register={register}
          error={errors?.password}
        />
      </div>
      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex flex-wrap gap-4">
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
        <InputField
          label="Birthday"
          name="birthday"
          defaultValue={data?.birthday?.toISOString?.().split("T")[0]}
          register={register}
          error={errors.birthday}
          type="date"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex</label>
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="w-full px-4 py-2 min-h-[100px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("subjects")}
            defaultValue={data?.subjects}
          >
            {subjects.map((subject: { id: number; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-red-500 text-xs mt-1 font-medium">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>
        <CldUploadWidget
          uploadPreset="winki_school"
          onSuccess={(result, { widget }) => {
            setImg(result.info);
            widget.close();
          }}
        >
          {({ open }) => {
            return (
              <div
                className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
                onClick={() => open()}
              >
                <Image src="/upload.png" alt="" width={28} height={28} />
                <span>Upload a photo</span>
              </div>
            );
          }}
        </CldUploadWidget>
      </div>
      {state.error && (
        <span className="text-red-500 text-xs mt-1 font-medium">{errorMessage}</span>
      )}
      <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default TeacherForm;