import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StackModel from "@/models/Stack";
import ResourceModel from "@/models/Resource";

// POST /api/v1/stacks/:stackId/copy → copy stack
export async function POST(request: NextRequest, { params }: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const stackId = (await params).stackId;
    const body = await request.json();
    
    // Find the original stack
    const originalStack = await StackModel.findById(stackId);
    // Check if stack exists
    if (!originalStack) return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    
    // Create a copy with the new owner
    const copiedStack = await StackModel.create({
      title: `${originalStack.title} (Copy)`,
      description: originalStack.description,
      emoji: originalStack.emoji,
      isPublic: false, // Copies are private by default
      ownerId: body.ownerId,
    });

    // Copy resources associated with the original stack (if any)
    const originalResources = await ResourceModel.find({ studyStackId: stackId });
    let copiedResources: Array<Record<string, unknown>> = [];
    if (originalResources && originalResources.length > 0) {
      const docsToInsert = originalResources.map(r => ({
        studyStackId: copiedStack._id,
        title: r.title,
        description: r.description,
        resourceType: r.resourceType,
        status: r.status,
        resourceUrl: r.resourceUrl,
        embedUrl: r.embedUrl,
        filePath: r.filePath,
        userNotes: r.userNotes,
      }))

      copiedResources = await ResourceModel.insertMany(docsToInsert)
    }

    return NextResponse.json({ copiedStack, copiedResources }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
