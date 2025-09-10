import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import QuizModel from '@/models/Quiz';
import ResourceModel from '@/models/Resource';
import StackModel from '@/models/Stack';
import { auth } from '@clerk/nextjs/server';

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
    generateQuizQuestions(String(savedQuiz._id), resources, numberOfQuestions, useHOTS);

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

// Background function to generate quiz questions
async function generateQuizQuestions(
  quizId: string,
  resources: Array<{ title: string; description?: string; resourceUrl: string; resourceType: string }>,
  numberOfQuestions: number,
  useHOTS: boolean
) {
  try {
    // Simulate AI generation delay (replace with actual AI service)
    await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000));

    // Here you would integrate with your AI service (OpenAI, Anthropic, etc.)
    // Prepare resource context for AI (commented out for demo)
    // const resourceContext = resources.map(r => ({
    //   title: r.title,
    //   description: r.description || '',
    //   type: r.resourceType,
    //   url: r.resourceUrl
    // }));
    // Example prompt for OpenAI:
    /*
    const prompt = `
    Create ${numberOfQuestions} multiple choice questions based on the following study resources:
    
    ${resourceContext.map(r => `- ${r.title}: ${r.description} (${r.type})`).join('\n')}
    
    Requirements:
    - Each question should have 4 options (A, B, C, D)
    - Only one correct answer per question
    - Include brief explanations for correct answers
    - ${useHOTS ? 'Focus on analysis, synthesis, and evaluation (Higher Order Thinking Skills)' : 'Focus on comprehension and application'}
    - Make questions relevant to the resource content
    
    Return as JSON array with structure:
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "${useHOTS ? 'hard' : 'medium'}"
    }
    `;
    
    // const aiResponse = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7
    // });
    */

    // For demo purposes, create sample questions
    const questions = [];
    const questionTypes = [
      'What is the main concept explained in',
      'Which of the following best describes',
      'According to the content in',
      'What would be the most appropriate application of',
      'How does the information in',
      'What can be inferred from'
    ];

    for (let i = 0; i < numberOfQuestions; i++) {
      const resource = resources[i % resources.length];
      const questionType = questionTypes[i % questionTypes.length];
      
      questions.push({
        question: `${questionType} "${resource.title}"?`,
        options: [
          `Primary concept related to ${resource.title}`,
          `Secondary aspect of ${resource.title}`,
          `Alternative interpretation of ${resource.title}`,
          `Unrelated concept to ${resource.title}`
        ],
        correctAnswer: 0, // First option is always correct in demo
        explanation: `This question tests your understanding of the key concepts presented in ${resource.title}. The correct answer focuses on the primary learning objective of this resource.`,
        difficulty: useHOTS ? 'hard' : 'medium'
      });
    }

    // Update quiz with generated questions
    await QuizModel.findByIdAndUpdate(quizId, {
      questions,
      status: 'ready',
      generatedAt: new Date()
    });

    console.log(`Successfully generated ${questions.length} questions for quiz ${quizId}`);

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    
    // Mark quiz as failed
    await QuizModel.findByIdAndUpdate(quizId, {
      status: 'failed'
    });
  }
}
