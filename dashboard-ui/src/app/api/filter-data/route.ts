import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "classes":
        const classes = await prisma.class.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ classes });

      case "teachers":
        const teachers = await prisma.teacher.findMany({
          select: { id: true, name: true, surname: true },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ teachers });

      case "subjects":
        const subjects = await prisma.subject.findMany({
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ subjects });

      case "students":
        const students = await prisma.student.findMany({
          select: { id: true, name: true, surname: true },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ students });

      case "parents":
        const parents = await prisma.parent.findMany({
          select: { id: true, name: true, surname: true },
          orderBy: { name: "asc" },
        });
        return NextResponse.json({ parents });

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching filter data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 