/**
 * Test script for AI Quiz Generation
 * 
 * This script tests the AI quiz generation functionality with sample resources.
 * Run this with: npm run test-ai-quiz (after adding the script to package.json)
 * or directly with: npx tsx test-ai-quiz.ts
 */

import { generateQuizWithAI, type QuizQuestion } from './src/lib/ai-quiz-generator';

async function testAIQuizGeneration() {
  console.log('🧪 Testing AI Quiz Generation...\n');

  // Sample resources for testing
  const sampleResources = [
    {
      title: 'Introduction to React Hooks',
      description: 'Learn about useState, useEffect, and custom hooks in React',
      resourceUrl: 'https://react.dev/reference/react',
      resourceType: 'webpage'
    },
    {
      title: 'JavaScript Async/Await Tutorial',
      description: 'Understanding asynchronous programming with async/await',
      resourceUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function',
      resourceType: 'webpage'
    }
  ];

  try {
    console.log('📚 Generating quiz from sample resources...');
    console.log('Resources:', sampleResources.map(r => `- ${r.title}`).join('\n'));
    console.log('');

    const questions = await generateQuizWithAI({
      resources: sampleResources,
      numberOfQuestions: 3,
      useHOTS: false
    });

    console.log('✅ Quiz generated successfully!\n');
    console.log(`📊 Generated ${questions.length} questions:\n`);

    questions.forEach((q: QuizQuestion, index: number) => {
      console.log(`Question ${index + 1}: ${q.question}`);
      console.log(`Options:`);
      q.options.forEach((option: string, i: number) => {
        const marker = i === q.correctAnswer ? '✓' : ' ';
        console.log(`  ${marker} ${String.fromCharCode(65 + i)}. ${option}`);
      });
      console.log(`Explanation: ${q.explanation}`);
      console.log(`Difficulty: ${q.difficulty}`);
      console.log('');
    });

    console.log('🎉 AI Quiz Generation test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 Make sure to set your OPENAI_API_KEY environment variable');
        console.log('   export OPENAI_API_KEY="your-api-key-here"');
      }
    }
    
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testAIQuizGeneration();
}

export { testAIQuizGeneration };
