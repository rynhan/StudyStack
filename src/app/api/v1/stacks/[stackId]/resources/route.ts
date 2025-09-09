import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import ResourceModel from "@/models/Resource";

// GET /api/v1/stacks/:stackId/resources → ambil semua resources dari stack tertentu
export async function GET(_req: NextRequest, context: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const { stackId } = await context.params
    const resources = await ResourceModel.find({ studyStackId: stackId });
    return NextResponse.json(resources, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

// POST /api/v1/stacks/:stackId/resources → buat resource baru di stack tertentu
export async function POST(req: NextRequest, context: { params: Promise<{ stackId: string }> }) {
  await dbConnect();
  try {
    const { stackId } = await context.params
    const body = await req.json();
    const resource = await ResourceModel.create({
      ...body,
      studyStackId: stackId,
    });
    return NextResponse.json(resource, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}
