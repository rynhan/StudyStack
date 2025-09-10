import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import QuizModel from '@/models/Quiz';
import ResourceModel from '@/models/Resource';
import StackModel from '@/models/Stack';
import { auth } from '@clerk/nextjs/server';
import { generateQuizWithAI } from '@/lib/ai-quiz-generator';


// POST /api/v1/stacks/[stackId]/quizzes - Create a new quiz
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ stackId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { stackId } = await params;
    const body = await request.json();
    const { title, description, resourceIds, numberOfQuestions, useHOTS } = body;

    // Verify stack exists and user owns it
    const stack = await StackModel.findById(stackId);
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    if (stack.ownerId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Verify resources exist and belong to the stack
    const resources = await ResourceModel.find({
      _id: { $in: resourceIds },
      studyStackId: stackId
    });

    if (resources.length !== resourceIds.length) {
      return NextResponse.json({ error: 'Some resources not found' }, { status: 400 });
    }

    // Create quiz with generating status
    const quiz = new QuizModel({
      studyStackId: stackId,
      title,
      description,
      resourceIds,
      numberOfQuestions,
      useHOTS,
      status: 'generating',
      ownerId: userId,
    });

    const savedQuiz = await quiz.save();

    // Start background quiz generation
    generateQuizQuestions(String(savedQuiz._id), resources, numberOfQuestions, useHOTS)
      .catch(error => {
        console.error('Background quiz generation failed:', error);
        // Update quiz status to failed
        QuizModel.findByIdAndUpdate(savedQuiz._id, { status: 'failed' }).catch(console.error);
      });

    return NextResponse.json(savedQuiz, { status: 201 });
  } catch (error) {
    console.error('Error creating quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/v1/stacks/[stackId]/quizzes - Get all quizzes for a stack
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ stackId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { stackId } = await params;

    // Verify stack exists and user has access
    const stack = await StackModel.findById(stackId);
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    if (stack.ownerId !== userId && !stack.isPublic) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const quizzes = await QuizModel.find({ studyStackId: stackId })
      .populate('resourceIds', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Background function to generate quiz questions using AI
async function generateQuizQuestions(
  quizId: string,
  resources: Array<{ title: string; description?: string; resourceUrl: string; resourceType: string }>,
  numberOfQuestions: number,
  useHOTS: boolean
) {
  try {
    console.log(`Starting AI quiz generation for quiz ${quizId} with ${numberOfQuestions} questions`);

    // Import the AI utility function

    // Generate quiz questions using AI
    const questions = await generateQuizWithAI({
      resources,
      numberOfQuestions,
      useHOTS: useHOTS || false
    });

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new Error('AI generation returned no questions');
    }

    // Update quiz with generated questions
    await QuizModel.findByIdAndUpdate(quizId, {
      questions,
      status: 'ready',
      generatedAt: new Date()
    });

    console.log(`Successfully generated ${questions.length} questions for quiz ${quizId} using AI`);

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    
    // Mark quiz as failed
    await QuizModel.findByIdAndUpdate(quizId, {
      status: 'failed'
    });

    // Re-throw the error so the calling function can handle it
    throw error;
  }
}
