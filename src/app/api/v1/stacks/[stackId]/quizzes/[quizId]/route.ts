import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import QuizModel from '@/models/Quiz';
import QuizAttemptModel from '@/models/QuizAttempt';
import StackModel from '@/models/Stack';
import { auth } from '@clerk/nextjs/server';

// GET /api/v1/stacks/[stackId]/quizzes/[quizId] - Get a specific quiz
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stackId: string; quizId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { stackId, quizId } = await params;

    // Verify stack exists and user has access
    const stack = await StackModel.findById(stackId);
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    if (stack.ownerId !== userId && !stack.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const quiz = await QuizModel.findById(quizId)
      .populate('resourceIds', 'title');

    if (!quiz || quiz.studyStackId.toString() !== stackId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/v1/stacks/[stackId]/quizzes/[quizId] - Delete a quiz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stackId: string; quizId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { stackId, quizId } = await params;

    // Verify stack exists and user owns it
    const stack = await StackModel.findById(stackId);
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    if (stack.ownerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const quiz = await QuizModel.findById(quizId);
    if (!quiz || quiz.studyStackId.toString() !== stackId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    // Delete all attempts for this quiz first
    await QuizAttemptModel.deleteMany({ quizId });
    
    // Delete the quiz
    await QuizModel.findByIdAndDelete(quizId);

    return NextResponse.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
