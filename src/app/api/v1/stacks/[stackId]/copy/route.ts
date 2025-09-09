import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StackModel from "@/models/Stack";

// POST /api/v1/stacks/:stackId/copy → copy stack
export async function POST(request: NextRequest, { params }: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const stackId = (await params).stackId;
    const body = await request.json();
    
    // Find the original stack
    const originalStack = await StackModel.findById(stackId);
    if (!originalStack) return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    
    // Create a copy with the new owner
    const copiedStack = await StackModel.create({
      title: `${originalStack.title} (Copy)`,
      description: originalStack.description,
      emoji: originalStack.emoji,
      isPublic: false, // Copies are private by default
      ownerId: body.ownerId,
    });
    
    return NextResponse.json(copiedStack, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
