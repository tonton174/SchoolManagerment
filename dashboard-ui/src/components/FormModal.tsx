"use client";

import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteComment,
} from "@/lib/actions";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: deleteSubject,
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  comment: deleteComment,
// TODO: OTHER DELETE ACTIONS
  parent: deleteSubject,
  lesson: deleteSubject,
  assignment: deleteSubject,
  result: deleteSubject,
  attendance: deleteSubject,
  event: deleteSubject,
  announcement: deleteSubject,
};

// USE LAZY LOADING

// import TeacherForm from "./forms/TeacherForm";
// import StudentForm from "./forms/StudentForm";

const TeacherForm = dynamic(() => import("./forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const CommentForm = dynamic(() => import("./forms/CommentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const LessonForm = dynamic(() => import("./forms/LessonForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
// TODO: OTHER FORMS

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any,
    onSuccess?: () => void
  ) => JSX.Element;
} = {
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
    // TODO OTHER LIST ITEMS
  ),
  comment: (setOpen, type, data, relatedData, onSuccess) => (
    <CommentForm
      type={type}
      data={data}
      students={relatedData?.students || []}
      lessons={relatedData?.lessons || []}
      teachers={relatedData?.teachers || []}
      onSuccess={onSuccess}
      setOpen={setOpen}
    />
  ),
  lesson: (setOpen, type, data, relatedData, onSuccess) => (
    <LessonForm
      type={type}
      data={data}
      subjects={relatedData?.subjects || []}
      classes={relatedData?.classes || []}
      teachers={relatedData?.teachers || []}
      onSuccess={onSuccess}
      setOpen={setOpen}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};

const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
  onSuccess,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    const [state, formAction] = useFormState(deleteActionMap[table], {
      success: false,
      error: false,
    });

    const router = useRouter();

    useEffect(() => {
      if (state.success) {
        toast(`${table} has been deleted!`);
        setOpen(false);
        router.refresh();
      }
    }, [state, router]);

    return type === "delete" && id ? (
      <div className="relative bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg mx-auto flex flex-col gap-4">
        <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl">×</button>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="text | number" name="id" value={id} hidden />
          <span className="text-center font-medium text-lg text-red-700">
            All data will be lost. Are you sure you want to delete this {table}?
          </span>
          <button className="bg-gradient-to-r from-red-500 to-red-700 text-white py-2 px-6 rounded-lg font-semibold shadow hover:from-red-600 hover:to-red-800 transition-all w-max self-center">
            Delete
          </button>
        </form>
      </div>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData, onSuccess)
    ) : (
      "Form not found!"
    );
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        {table === "comment" ? (
          <Image src="/plus.png" alt="Comment" width={16} height={16} />
        ) : type === "update" ? (
          <Image src="/update.png" alt="Update" width={16} height={16} />
        ) : type === "delete" ? (
          <Image src="/delete.png" alt="Delete" width={16} height={16} />
        ) : (
          <Image src="/plus.png" alt="Add" width={16} height={16} />
        )}
      </button>
      {open && (
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-transparent p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;