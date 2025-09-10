import { ChatOpenAI } from '@langchain/openai';

// JSON Schema for quiz question structure
const QuizQuestionSchema = {
  type: "object",
  properties: {
    question: {
      type: "string",
      description: "The quiz question text"
    },
    options: {
      type: "array",
      items: { type: "string" },
      minItems: 4,
      maxItems: 4,
      description: "Four multiple choice options"
    },
    correctAnswer: {
      type: "number",
      minimum: 0,
      maximum: 3,
      description: "Index of the correct answer (0-3)"
    },
    explanation: {
      type: "string",
      description: "Detailed explanation of the correct answer"
    },
    difficulty: {
      type: "string",
      enum: ["easy", "medium", "hard"],
      description: "Question difficulty level"
    }
  },
  required: ["question", "options", "correctAnswer", "explanation", "difficulty"]
};

const QuizResponseSchema = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: QuizQuestionSchema,
      description: "Array of quiz questions"
    }
  },
  required: ["questions"]
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizResponse {
  questions: QuizQuestion[];
}





// Interface for resource input
export interface ResourceInput {
  title: string;
  description?: string;
  resourceUrl: string;
  resourceType: string;
}

export interface GenerateQuizOptions {
  resources: ResourceInput[];
  numberOfQuestions: number;
  useHOTS?: boolean;
}





export async function generateQuizWithAI(options: GenerateQuizOptions): Promise<QuizQuestion[]> {
  const { resources, numberOfQuestions, useHOTS = false } = options;

  // Validate input
  if (!resources || !Array.isArray(resources) || resources.length === 0) {
    throw new Error('Resources array is required and cannot be empty');
  }
  if (!numberOfQuestions || numberOfQuestions < 1 || numberOfQuestions > 50) {
    throw new Error('Number of questions must be between 1 and 50');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  // Initialize OpenAI model
  const model = new ChatOpenAI({
    modelName: 'gpt-4o-mini',
    temperature: 0.5,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  // Bind schema to model using structured output
  const modelWithStructure = model.withStructuredOutput(QuizResponseSchema);

  // Prepare resource context
  const resourceContext = resources.map((r: ResourceInput) => ({
    title: r.title,
    description: r.description || 'No description provided',
    type: r.resourceType,
    url: r.resourceUrl
  }));

  const resourceList = resourceContext
    .map((r, index) => `${index + 1}. **${r.title}** (${r.type}) \n- Description: ${r.description} \n- URL: ${r.url}`)
    .join('\n\n');

  const cognitiveLevel = useHOTS
    ? 'Focus on Higher Order Thinking Skills (HOTS): analysis, synthesis, evaluation, and critical thinking. Questions should require students to analyze relationships, evaluate arguments, synthesize information, and apply concepts to new situations.'
    : 'Focus on comprehension and application: understanding key concepts, remembering important facts, and applying knowledge to familiar situations.';

  // Create the prompt
  const prompt = `You are an expert educator creating high-quality multiple choice quiz questions based on study resources.

Create ${numberOfQuestions} multiple choice questions based on the following study resources:

${resourceList}

Requirements:
- Each question must have exactly 4 options
- Only one correct answer per question
- Include detailed explanations for correct answers
- ${cognitiveLevel}
- Make questions directly relevant to the resource content
- Ensure questions test understanding, not just memorization
- Vary question difficulty and types
- Use clear, unambiguous language

Focus Areas:
- Key concepts and principles from the resources
- Practical applications of the material
- Relationships between different concepts
- Critical thinking about the subject matter`;

  console.log('Generating quiz with AI...');

  try {
    // Invoke the model to produce structured output
    const structuredOutput = await modelWithStructure.invoke(prompt) as QuizResponse;

    // Ensure we have the requested number of questions
    if (structuredOutput.questions.length !== numberOfQuestions) {
      console.warn(`Requested ${numberOfQuestions} questions but got ${structuredOutput.questions.length}`);
    }

    // Set difficulty based on HOTS preference if not already set
    const questionsWithDifficulty = structuredOutput.questions.map((q: QuizQuestion) => ({
      ...q,
      difficulty: q.difficulty || (useHOTS ? ('hard' as const) : ('medium' as const))
    }));

    return questionsWithDifficulty;

  } catch (error) {
    console.error('Failed to generate structured quiz output:', error);
    throw new Error('Failed to generate quiz questions with AI');
  }
}