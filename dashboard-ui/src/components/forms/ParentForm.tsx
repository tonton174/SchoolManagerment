"use client";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface ParentFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}

const ParentForm = ({ type, data, setOpen }: ParentFormProps) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: data?.name || "",
      surname: data?.surname || "",
      email: data?.email || "",
      phone: data?.phone || "",
    },
  });

  const router = useRouter();

  useEffect(() => {
    reset({
      name: data?.name || "",
      surname: data?.surname || "",
      email: data?.email || "",
      phone: data?.phone || "",
    });
  }, [data, reset]);

  const onSubmit = async (formData: any) => {
    try {
      const body = type === "update"
        ? { ...formData, id: data.id }
        : formData;
      const res = await fetch(`/api/parents${type === "update" ? `?id=${data.id}` : ""}`, {
        method: type === "update" ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(`Parent has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else {
        const err = await res.json();
        toast.error(err.error || "Something went wrong!");
      }
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative bg-white p-8 rounded-xl shadow-lg w-full max-w-lg mx-auto flex flex-col gap-4">
      <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl">×</button>
      <h2 className="text-xl font-bold mb-2">{type === "create" ? "Add Parent" : "Update Parent"}</h2>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">First Name</label>
        <input {...register("name", { required: true })} className="p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 text-base" />
        {errors.name && <span className="text-xs text-red-400">First name is required</span>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Last Name</label>
        <input {...register("surname", { required: true })} className="p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 text-base" />
        {errors.surname && <span className="text-xs text-red-400">Last name is required</span>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Email</label>
        <input type="email" {...register("email", { required: true })} className="p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 text-base" />
        {errors.email && <span className="text-xs text-red-400">Email is required</span>}
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-500">Phone</label>
        <input {...register("phone", { required: true })} className="p-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-400 text-base" />
        {errors.phone && <span className="text-xs text-red-400">Phone is required</span>}
      </div>
      <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg text-lg p-3 mt-2 shadow hover:from-blue-600 hover:to-purple-600 transition-all">{type === "create" ? "Add Parent" : "Update Parent"}</button>
    </form>
  );
};

export default ParentForm; 