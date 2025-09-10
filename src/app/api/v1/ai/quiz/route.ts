import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateQuizWithAI } from '../../../../../lib/ai-quiz-generator';

// POST /api/v1/ai/quiz - Generate quiz questions using AI
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { resources, numberOfQuestions, useHOTS } = body;

    // Validate input
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return NextResponse.json({ error: 'Resources array is required' }, { status: 400 });
    }
    // Extra layer validation
    if (!numberOfQuestions || numberOfQuestions < 1 || numberOfQuestions > 50) {
      return NextResponse.json({ error: 'Number of questions must be between 1 and 50' }, { status: 400 });
    }

    // Generate quiz questions using the AI utility
    const questions = await generateQuizWithAI({
      resources,
      numberOfQuestions,
      useHOTS: useHOTS || false
    });

    return NextResponse.json({
      questions,
      generatedAt: new Date().toISOString(),
      resourcesUsed: resources.length,
      cognitiveLevel: useHOTS ? 'HOTS' : 'Standard'
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json({ 
          error: 'AI service configuration error' 
        }, { status: 503 });
      }
      
      if (error.message.includes('questions must be between')) {
        return NextResponse.json({ 
          error: error.message 
        }, { status: 400 });
      }
    }

    return NextResponse.json({ 
      error: 'Failed to generate quiz questions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET /api/v1/ai/quiz - Get information about the AI quiz generation service
export async function GET() {
  return NextResponse.json({
    service: 'AI Quiz Generation',
    version: '1.0.0',
    supportedQuestionTypes: ['multiple-choice'],
    maxQuestions: 50,
    supportedDifficulties: ['easy', 'medium', 'hard'],
    features: [
      'Higher Order Thinking Skills (HOTS) support',
      'Structured output with explanations',
      'Resource-based question generation',
      'Configurable difficulty levels'
    ]
  });
}
