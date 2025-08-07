"use client";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "react-toastify";

interface LessonFormProps {
  type: "create" | "update";
  data?: any;
  subjects: Array<{ id: number; name: string }>;
  classes: Array<{ id: number; name: string }>;
  teachers: Array<{ id: string; name: string; surname: string }>;
  onSuccess?: () => void;
  setOpen?: (open: boolean) => void;
}

const LessonForm = ({ type, data, subjects, classes, teachers, onSuccess, setOpen }: LessonFormProps) => {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: data || {
      name: "",
      day: "MONDAY",
      startTime: "",
      endTime: "",
      subjectId: "",
      classId: "",
      teacherId: "",
    },
  });

  const onSubmit = (formData: any) => {
    startTransition(async () => {
      try {
        const response = await fetch('/api/lessons', {
          method: type === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: data?.id }),
        });
        if (response.ok) {
          toast.success(type === "create" ? "Lesson created!" : "Lesson updated!");
          reset();
          if (onSuccess) onSuccess();
          if (setOpen) setOpen(false);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Error!");
        }
      } catch (error) {
        toast.error("Error!");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg space-y-6 border border-gray-100 relative">
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
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">Lesson name *</label>
        <input {...register("name", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">Required</p>}
      </div>
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">Day *</label>
        <select {...register("day", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="MONDAY">Monday</option>
          <option value="TUESDAY">Tuesday</option>
          <option value="WEDNESDAY">Wednesday</option>
          <option value="THURSDAY">Thursday</option>
          <option value="FRIDAY">Friday</option>
        </select>
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-base font-semibold text-gray-800 mb-2">Start Time *</label>
          <input type="datetime-local" {...register("startTime", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
        <div className="flex-1">
          <label className="block text-base font-semibold text-gray-800 mb-2">End Time *</label>
          <input type="datetime-local" {...register("endTime", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">Subject *</label>
        <select {...register("subjectId", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Select subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">Class *</label>
        <select {...register("classId", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Select class</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-base font-semibold text-gray-800 mb-2">Teacher *</label>
        <select {...register("teacherId", { required: true })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="">Select teacher</option>
          {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.surname}</option>)}
        </select>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPending} className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50">
          {isPending ? "Processing..." : type === "create" ? "Add lesson" : "Update lesson"}
        </button>
      </div>
    </form>
  );
};

export default LessonForm; 