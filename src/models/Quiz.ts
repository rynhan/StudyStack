import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface IQuiz extends Document {
  studyStackId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  resourceIds: mongoose.Types.ObjectId[]; // Resources used to generate this quiz
  questions: IQuizQuestion[];
  numberOfQuestions: number;
  useHOTS?: boolean; // Higher Order Thinking Skills
  status: 'generating' | 'ready' | 'failed';
  generatedAt?: Date;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  explanation: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] }
});

const QuizSchema = new Schema<IQuiz>(
  {
    studyStackId: { type: Schema.Types.ObjectId, ref: "Stack", required: true },
    title: { type: String, required: true },
    description: { type: String },
    resourceIds: [{ type: Schema.Types.ObjectId, ref: "Resource" }],
    questions: [QuizQuestionSchema],
    numberOfQuestions: { type: Number, required: true },
    useHOTS: { type: Boolean, default: false },
    status: { type: String, enum: ['generating', 'ready', 'failed'], default: 'generating' },
    generatedAt: { type: Date },
    ownerId: { type: String, required: true },
  },
  { timestamps: true }
);

const QuizModel: Model<IQuiz> =
  mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);

export default QuizModel;
