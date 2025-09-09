import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StackModel from "@/models/Stack";

// GET /api/v1/stacks → ambil semua stacks yang ada
export async function GET() {
  await dbConnect();
  const stacks = await StackModel.find({});
  return NextResponse.json(stacks, { status: 200 });
}

// POST /api/v1/stacks → buat stack baru
export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const newStack = await StackModel.create(body);
    return NextResponse.json(newStack, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
