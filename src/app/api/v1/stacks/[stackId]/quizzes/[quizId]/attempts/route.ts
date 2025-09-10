import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import QuizModel from '@/models/Quiz';
import QuizAttemptModel from '@/models/QuizAttempt';
import StackModel from '@/models/Stack';
import { auth } from '@clerk/nextjs/server';

// POST /api/v1/stacks/[stackId]/quizzes/[quizId]/attempts - Submit a quiz attempt
export async function POST(
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
    const body = await request.json();
    const { answers, timeSpent } = body;

    // Verify stack exists and user has access
    const stack = await StackModel.findById(stackId);
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    if (stack.ownerId !== userId && !stack.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const quiz = await QuizModel.findById(quizId);
    if (!quiz || quiz.studyStackId.toString() !== stackId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.status !== 'ready') {
      return NextResponse.json({ error: 'Quiz is not ready' }, { status: 400 });
    }

    // Calculate score
    let correctAnswers = 0;
    const userAnswers = answers.map((answer: { selectedAnswer: number; timeSpent?: number }, index: number) => {
      const isCorrect = answer.selectedAnswer === quiz.questions[index].correctAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeSpent: answer.timeSpent || 0
      };
    });

    const score = Math.round((correctAnswers / quiz.questions.length) * 100);

    // Save attempt
    const attempt = new QuizAttemptModel({
      quizId,
      userId,
      answers: userAnswers,
      score,
      totalQuestions: quiz.questions.length,
      correctAnswers,
      timeSpent,
      completedAt: new Date()
    });

    const savedAttempt = await attempt.save();

    return NextResponse.json(savedAttempt, { status: 201 });
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/v1/stacks/[stackId]/quizzes/[quizId]/attempts - Get user's attempts for a quiz
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

    const quiz = await QuizModel.findById(quizId);
    if (!quiz || quiz.studyStackId.toString() !== stackId) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const attempts = await QuizAttemptModel.find({ 
      quizId, 
      userId 
    }).sort({ createdAt: -1 });

    return NextResponse.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
