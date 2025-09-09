import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StackModel from "@/models/Stack";

// GET /api/v1/stacks/:stackId → ambil 1 stack
export async function GET(request: NextRequest, { params }: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const stackId = (await params).stackId;
    const stack = await StackModel.findById(stackId);
    if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(stack, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

// PUT /api/v1/stacks/:stackId → update stack
export async function PUT(request: NextRequest, { params }: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const stackId = (await params).stackId;
    const body = await request.json();
    const updatedStack = await StackModel.findByIdAndUpdate(stackId, body, {
      new: true,
      runValidators: true,
    });
    if (!updatedStack) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updatedStack, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

// DELETE /api/v1/stacks/:stackId → hapus stack
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const stackId = (await params).stackId;
    const deleted = await StackModel.findByIdAndDelete(stackId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
