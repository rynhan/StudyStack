import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import ResourceModel from "@/models/Resource";

// GET /api/v1/stacks/:stackId/resources/:resourceId → ambil 1 resource dari stack tertentu
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ stackId: string; resourceId: string }> }
) {
  await dbConnect();
  const { stackId, resourceId } = await context.params
  const resource = await ResourceModel.findOne({
    _id: resourceId,
    studyStackId: stackId,
  });
  if (!resource) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(resource, { status: 200 });
}

// PUT /api/v1/stacks/:stackId/resources/:resourceId → update resource
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ stackId: string; resourceId: string }> }
) {
  await dbConnect();
  try {
    const { stackId, resourceId } = await context.params
    const body = await req.json();
    const updated = await ResourceModel.findOneAndUpdate(
      { _id: resourceId, studyStackId: stackId },
      body,
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Unknown error" }, { status: 400 });
  }
}

// DELETE /api/v1/stacks/:stackId/resources/:resourceId → hapus resource
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ stackId: string; resourceId: string }> }
) {
  await dbConnect();
  const { stackId, resourceId } = await context.params
  const deleted = await ResourceModel.findOneAndDelete({
    _id: resourceId,
    studyStackId: stackId,
  });
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
}
