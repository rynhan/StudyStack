import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongoose";
import StackModel from "@/models/Stack";

// GET /api/v1/stacks/:stackId → ambil 1 stack dengan resource count
export async function GET(request: NextRequest, { params }: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const stackId = (await params).stackId;
    
    // Use aggregation to include resource count
    const stackWithResourceCount = await StackModel.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(stackId) } },
      {
        $lookup: {
          from: 'resources',
          localField: '_id',
          foreignField: 'studyStackId',
          as: 'resources'
        }
      },
      {
        $addFields: {
          resourceCount: { $size: '$resources' }
        }
      },
      {
        $project: {
          resources: 0
        }
      }
    ]);
    
    if (!stackWithResourceCount || stackWithResourceCount.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    
    return NextResponse.json(stackWithResourceCount[0], { status: 200 });
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
