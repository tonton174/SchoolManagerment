import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  // Lấy danh sách parent (nếu cần)
  const parents = await prisma.parent.findMany();
  return NextResponse.json(parents);
}

export async function POST(request: NextRequest) {
  try {
    const { id, username, name, surname, email, phone, address } = await request.json();
    if (!id || !username || !name || !surname || !email || !phone || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const created = await prisma.parent.create({
      data: { id, username, name, surname, email, phone, address },
    });
    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, surname, email, phone, address } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing parent id" }, { status: 400 });
    }
    const updated = await prisma.parent.update({
      where: { id },
      data: { name, surname, email, phone, address },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 