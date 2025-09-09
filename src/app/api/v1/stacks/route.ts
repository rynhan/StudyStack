import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import StackModel from "@/models/Stack";

// GET /api/v1/stacks → ambil semua stacks dengan resource count
export async function GET() {
  await dbConnect();
  
  // Use MongoDB aggregation to include resource count
  const stacksWithResourceCount = await StackModel.aggregate([
    {
      $lookup: {
        from: 'resources', // MongoDB collection name (lowercase + plural)
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
        resources: 0 // Remove the resources array, keep only the count
      }
    }
  ]);
  
  return NextResponse.json(stacksWithResourceCount, { status: 200 });
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
