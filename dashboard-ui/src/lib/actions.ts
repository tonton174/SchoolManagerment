"use server";

import { revalidatePath } from "next/cache";
import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  CommentSchema,
  AnnouncementSchema,
  EventSchema,
  ResultSchema,
  AssignmentSchema,
  StudentBasicUpdateSchema,
} from "./formValidationSchemas";
import prisma from "./prisma";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";

type CurrentState = { success: boolean; error: boolean | { message: string } };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err: any) {
    console.log("Error creating subject:", err);
    
    // Handle unique constraint violation
    if (err.code === 'P2002' && err.meta?.target?.includes('name')) {
      return { 
        success: false, 
        error: { message: "Subject name already exists. Please choose a different name." }
      };
    }
    
    return { 
      success: false, 
      error: { message: err.message || "Failed to create subject" }
    };
  }
};

export const linkStudentToClerk = async (
  currentState: CurrentState,
  data: { studentId: string; password?: string }
) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: data.studentId } });
    if (!student) return { success: false, error: true };
    if (student.authUserId) return { success: true, error: false }; // already linked

    const clerk = await clerkClient();
    const user = await clerk.users.createUser({
      username: student.username,
      ...(data.password ? { password: data.password } : {}),
      firstName: student.name,
      lastName: student.surname,
      publicMetadata: { role: "student" },
    } as any);

    await prisma.student.update({
      where: { id: student.id },
      data: { authUserId: user.id },
    });

    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    await prisma.subject.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers.map((teacherId) => ({ id: teacherId })),
        },
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.subject.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    console.log("Creating class with data:", data);
    console.log("Grade ID in action:", data.gradeId);
    console.log("Grade ID type in action:", typeof data.gradeId);
    
    await prisma.class.create({
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log("Error creating class:", err);
    return { success: false, error: true };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data,
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.class.delete({
      where: {
        id: parseInt(id),
      },
    });

    // revalidatePath("/list/class");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.createUser({
      username: data.username,
      password: data.password,
      firstName: data.name,
      lastName: data.surname,
      publicMetadata:{role:"teacher"}
    });

    await prisma.teacher.create({
      data: {
        id: user.id,
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType || "",
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err: any) {
    console.log("CREATE TEACHER ERROR:", err);
    if (err?.errors) {
      return { success: false, error: { errors: err.errors } };
    }
    if (err?.message) {
      return { success: false, error: { message: err.message } };
    }
    if (typeof err === "string") {
      return { success: false, error: { message: err } };
    }
    return { success: false, error: { message: JSON.stringify(err) } };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  if (!data.id) {
    return { success: false, error: { message: "Missing teacher id" } };
  }
  try {
    const clerk = await clerkClient();
    const user = await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password !== "" && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        ...(data.password !== "" && { password: data.password }),
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType || "",
        sex: data.sex,
        birthday: data.birthday,
        subjects: {
          set: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        },
      },
    });
    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err: any) {
    console.log(err);
    // Trả về lỗi chi tiết nếu có
    if (err?.errors) {
      return { success: false, error: { errors: err.errors } };
    }
    if (err?.message) {
      return { success: false, error: { message: err.message } };
    }
    return { success: false, error: { message: err?.toString?.() || "Unknown error" } };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(id);

    await prisma.teacher.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  console.log(data);
  try {
    // Validate required fields
    if (!data.classId || !data.gradeId || !data.name) {
      return { 
        success: false, 
        error: { message: "Missing required fields: classId, gradeId, name" } 
      };
    }

    // Generate username if not provided
    let username = data.username;
    if (!username || username.trim() === '') {
      username = `${data.name.toLowerCase()}${data.surname.toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    }

    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (!classItem) {
      return { 
        success: false, 
        error: { message: "Class not found" } 
      };
    }

    if (classItem.capacity === classItem._count.students) {
      return { 
        success: false, 
        error: { message: "Class is full" } 
      };
    }

    // Create student WITHOUT Clerk user (use internal UUID as primary id)
    const studentId = randomUUID();
    console.log("Creating student with data:", {
      id: studentId,
      authUserId: null,
      username: username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      address: data.address,
      img: data.img || null,
      sex: data.sex,
      birthday: data.birthday,
      gradeId: data.gradeId,
      classId: data.classId,
      parentId: data.parentId || null,
    });

    const newStudent = await prisma.student.create({
      data: {
        id: studentId,
        authUserId: null,
        username: username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        address: data.address,
        img: data.img || null,
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        ...(data.parentId ? { parentId: data.parentId } : {}),
      },
    });

    console.log("Student created successfully:", newStudent);
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { 
      success: false, 
      error: { message: err instanceof Error ? err.message : "Unknown error occurred" } 
    };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        // phone removed from student form
        address: data.address,
        img: data.img || null,
        // bloodType removed from student form
        sex: data.sex,
        birthday: data.birthday,
        gradeId: data.gradeId,
        classId: data.classId,
        ...(data.parentId ? { parentId: data.parentId } : { parentId: null }),
      },
    });
    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    await prisma.student.delete({
      where: {
        id: id,
      },
    });

    // revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateStudentBasic = async (
  currentState: CurrentState,
  data: StudentBasicUpdateSchema
) => {
  try {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // Load current student to evaluate permissions
    const currentStudent = await prisma.student.findUnique({
      where: { id: data.id },
      select: { id: true, classId: true },
    });
    if (!currentStudent) return { success: false, error: true };

    // If teacher, ensure they teach this student's class and cannot change classId
    if (role !== "admin") {
      if (!userId) return { success: false, error: true };
      const teachesThisClass = await prisma.lesson.findFirst({
        where: { classId: currentStudent.classId, teacherId: userId },
        select: { id: true },
      });
      if (!teachesThisClass) return { success: false, error: true };
    }

    await prisma.student.update({
      where: { id: data.id },
      data: {
        name: data.name,
        ...(data.surname !== undefined ? { surname: data.surname } : {}),
        birthday: data.birthday,
        // Only admin can move class
        ...((sessionClaims?.metadata as { role?: string })?.role === "admin" && data.classId
          ? { classId: data.classId }
          : {}),
        ...(data.parentId ? { parentId: data.parentId } : { parentId: null }),
      },
    });
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.create({
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    // if (role === "teacher") {
    //   const teacherLesson = await prisma.lesson.findFirst({
    //     where: {
    //       teacherId: userId!,
    //       id: data.lessonId,
    //     },
    //   });

    //   if (!teacherLesson) {
    //     return { success: false, error: true };
    //   }
    // }

    await prisma.exam.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startTime: data.startTime,
        endTime: data.endTime,
        lessonId: data.lessonId,
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;

  // const { userId, sessionClaims } = auth();
  // const role = (sessionClaims?.metadata as { role?: string })?.role;

  try {
    await prisma.exam.delete({
      where: {
        id: parseInt(id),
        // ...(role === "teacher" ? { lesson: { teacherId: userId! } } : {}),
      },
    });

    // revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Comment Actions (Lưu vào database)
export const createComment = async (
  currentState: CurrentState,
  data: CommentSchema
) => {
  try {
    console.log("Creating comment:", data);
    
    // Lưu vào database
    const newComment = await prisma.comment.create({
      data: {
        content: data.content,
        type: data.type,
        teacherId: data.teacherId,
        studentId: data.studentId,
        lessonId: data.lessonId || null,
      },
      include: {
        student: {
          include: { class: true }
        },
        teacher: true,
        lesson: {
          include: { subject: true }
        }
      }
    });
    
    console.log("Comment created in database:", newComment);

    // revalidatePath("/list/comments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateComment = async (
  currentState: CurrentState,
  data: CommentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating comment:", data);
    
    const updatedComment = await prisma.comment.update({
      where: {
        id: data.id,
      },
      data: {
        content: data.content,
        type: data.type,
        lessonId: data.lessonId || null,
      },
    });
    
    console.log("Comment updated:", updatedComment);

    // revalidatePath("/list/comments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteComment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting comment:", id);
    
    await prisma.comment.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Comment deleted successfully");

    // revalidatePath("/list/comments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Announcement Actions
export const createAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  try {
    console.log("Creating announcement:", data);
    
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
      include: {
        class: true,
      },
    });
    
    console.log("Announcement created:", newAnnouncement);

    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAnnouncement = async (
  currentState: CurrentState,
  data: AnnouncementSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating announcement:", data);
    
    const updatedAnnouncement = await prisma.announcement.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
        classId: data.classId || null,
      },
      include: {
        class: true,
      },
    });
    
    console.log("Announcement updated:", updatedAnnouncement);

    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAnnouncement = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting announcement:", id);
    
    await prisma.announcement.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Announcement deleted successfully");

    // revalidatePath("/list/announcements");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Event Actions
export const createEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  try {
    console.log("Creating event:", data);
    
    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
      include: {
        class: true,
      },
    });
    
    console.log("Event created:", newEvent);

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateEvent = async (
  currentState: CurrentState,
  data: EventSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating event:", data);
    
    const updatedEvent = await prisma.event.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId || null,
      },
      include: {
        class: true,
      },
    });
    
    console.log("Event updated:", updatedEvent);

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteEvent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting event:", id);
    
    await prisma.event.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Event deleted successfully");

    // revalidatePath("/list/events");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Result Actions
export const createResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  try {
    console.log("Creating result:", data);
    
    const newResult = await prisma.result.create({
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
      include: {
        student: true,
        exam: {
          include: {
            lesson: {
              include: {
                class: true,
                teacher: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              include: {
                class: true,
                teacher: true,
              },
            },
          },
        },
      },
    });
    
    console.log("Result created:", newResult);

    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateResult = async (
  currentState: CurrentState,
  data: ResultSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating result:", data);
    
    const updatedResult = await prisma.result.update({
      where: {
        id: data.id,
      },
      data: {
        score: data.score,
        examId: data.examId || null,
        assignmentId: data.assignmentId || null,
        studentId: data.studentId,
      },
      include: {
        student: true,
        exam: {
          include: {
            lesson: {
              include: {
                class: true,
                teacher: true,
              },
            },
          },
        },
        assignment: {
          include: {
            lesson: {
              include: {
                class: true,
                teacher: true,
              },
            },
          },
        },
      },
    });
    
    console.log("Result updated:", updatedResult);

    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteResult = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting result:", id);
    
    await prisma.result.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Result deleted successfully");

    // revalidatePath("/list/results");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Assignment Actions
export const createAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  try {
    console.log("Creating assignment:", data);
    
    const newAssignment = await prisma.assignment.create({
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
      },
    });
    
    console.log("Assignment created:", newAssignment);

    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateAssignment = async (
  currentState: CurrentState,
  data: AssignmentSchema
) => {
  if (!data.id) {
    return { success: false, error: true };
  }
  try {
    console.log("Updating assignment:", data);
    
    const updatedAssignment = await prisma.assignment.update({
      where: {
        id: data.id,
      },
      data: {
        title: data.title,
        startDate: data.startDate,
        dueDate: data.dueDate,
        lessonId: data.lessonId,
      },
      include: {
        lesson: {
          include: {
            subject: true,
            class: true,
            teacher: true,
          },
        },
      },
    });
    
    console.log("Assignment updated:", updatedAssignment);

    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteAssignment = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting assignment:", id);
    
    await prisma.assignment.delete({
      where: {
        id: parseInt(id),
      },
    });

    console.log("Assignment deleted successfully");

    // revalidatePath("/list/assignments");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

// Lesson Actions
export const createLesson = async (
  currentState: CurrentState,
  data: any
) => {
  try {
    console.log("Creating lesson:", data);
    
    // Parse datetime strings to Date objects
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { 
        success: false, 
        error: { message: "Invalid date format for start time or end time" }
      };
    }
    
    const newLesson = await prisma.lesson.create({
      data: {
        name: data.name,
        day: data.day,
        startTime: startTime,
        endTime: endTime,
        subjectId: parseInt(data.subjectId),
        classId: parseInt(data.classId),
        teacherId: data.teacherId,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
    
    console.log("Lesson created:", newLesson);

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log("Error creating lesson:", err);
    return { 
      success: false, 
      error: { message: err.message || "Failed to create lesson" }
    };
  }
};

export const updateLesson = async (
  currentState: CurrentState,
  data: any
) => {
  if (!data.id) {
    return { success: false, error: { message: "Missing lesson id" } };
  }
  try {
    console.log("Updating lesson:", data);
    
    // Parse datetime strings to Date objects
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    
    // Validate dates
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return { 
        success: false, 
        error: { message: "Invalid date format for start time or end time" }
      };
    }
    
    const updatedLesson = await prisma.lesson.update({
      where: {
        id: parseInt(data.id),
      },
      data: {
        name: data.name,
        day: data.day,
        startTime: startTime,
        endTime: endTime,
        subjectId: parseInt(data.subjectId),
        classId: parseInt(data.classId),
        teacherId: data.teacherId,
      },
      include: {
        subject: true,
        class: true,
        teacher: true,
      },
    });
    
    console.log("Lesson updated:", updatedLesson);

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log("Error updating lesson:", err);
    return { 
      success: false, 
      error: { message: err.message || "Failed to update lesson" }
    };
  }
};

export const deleteLesson = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("Deleting lesson:", id);
    console.log("FormData entries:", Array.from(data.entries()));
    
    if (!id) {
      console.log("No ID provided for lesson deletion");
      return { success: false, error: { message: "No lesson ID provided" } };
    }
    
    const lessonId = parseInt(id);
    if (isNaN(lessonId)) {
      console.log("Invalid lesson ID:", id);
      return { success: false, error: { message: "Invalid lesson ID" } };
    }
    
    await prisma.lesson.delete({
      where: {
        id: lessonId,
      },
    });

    console.log("Lesson deleted successfully");

    revalidatePath("/list/lessons");
    return { success: true, error: false };
  } catch (err: any) {
    console.log("Error deleting lesson:", err);
    return { 
      success: false, 
      error: { message: err.message || "Failed to delete lesson" }
    };
  }
};