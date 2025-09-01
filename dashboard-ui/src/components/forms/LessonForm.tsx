"use client";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-toastify";
import { createLesson, updateLesson } from "@/lib/actions";

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
  const [state, setState] = useState<any>({
    success: false,
    error: false,
  });
  
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [weeksToRepeat, setWeeksToRepeat] = useState(1);
  
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

  const onSubmit = handleSubmit(async (formData: any) => {
    try {
      if (type === "create") {
        if (repeatWeekly && weeksToRepeat > 0) {
          // Create multiple lessons for weekly repetition
          const results = [];
          for (let i = 0; i <= weeksToRepeat; i++) {
            const lessonData = {
              ...formData,
              name: i === 0 ? formData.name : `${formData.name} ${i + 1}`,
              startTime: new Date(formData.startTime),
              endTime: new Date(formData.endTime),
            };
            
            // Add weeks to dates for repeated lessons
            if (i > 0) {
              lessonData.startTime.setDate(lessonData.startTime.getDate() + (i * 7));
              lessonData.endTime.setDate(lessonData.endTime.getDate() + (i * 7));
            }
            
            const result = await createLesson(state, lessonData);
            results.push(result);
            
            if (!result.success) {
              toast.error(`Failed to create lesson ${i + 1}: ${typeof result.error === 'object' && result.error?.message ? result.error.message : "Error!"}`);
              return;
            }
          }
          
          setState({ success: true, error: false });
          toast.success(`Successfully created ${weeksToRepeat + 1} lessons!`);
          reset();
          if (onSuccess) onSuccess();
          if (setOpen) setOpen(false);
        } else {
          // Create single lesson
          const result = await createLesson(state, formData);
          
          if (result.success) {
            setState({ success: true, error: false });
            toast.success("Lesson created!");
            reset();
            if (onSuccess) onSuccess();
            if (setOpen) setOpen(false);
          } else {
            setState({ success: false, error: result.error });
            toast.error(typeof result.error === 'object' && result.error?.message ? result.error.message : "Error!");
          }
        }
      } else {
        // Update lesson
        const result = await updateLesson(state, { ...formData, id: data?.id });
        
        if (result.success) {
          setState({ success: true, error: false });
          toast.success("Lesson updated!");
          reset();
          if (onSuccess) onSuccess();
          if (setOpen) setOpen(false);
        } else {
          setState({ success: false, error: result.error });
          toast.error(typeof result.error === 'object' && result.error?.message ? result.error.message : "Error!");
        }
      }
    } catch (error) {
      setState({ success: false, error: { message: "An unexpected error occurred" } });
      toast.error("Error!");
    }
  });

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
      
      {/* Weekly repetition options - only show for create mode */}
      {type === "create" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="repeatWeekly"
              checked={repeatWeekly}
              onChange={(e) => setRepeatWeekly(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="repeatWeekly" className="text-sm font-medium text-gray-700">
              Lặp lại hàng tuần
            </label>
          </div>
          
          {repeatWeekly && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Số tuần lặp lại:
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={weeksToRepeat}
                onChange={(e) => setWeeksToRepeat(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="text-xs text-gray-500">
                (sẽ tạo {weeksToRepeat + 1} lesson)
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
         <button type="submit" className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold shadow hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-50">
           {type === "create" 
             ? (repeatWeekly && weeksToRepeat > 0 
                 ? `Add ${weeksToRepeat + 1} lessons` 
                 : "Add lesson")
             : "Update lesson"}
         </button>
       </div>
    </form>
  );
};

export default LessonForm; 