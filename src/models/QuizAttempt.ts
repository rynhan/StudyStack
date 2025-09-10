import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserAnswer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent?: number; // in seconds
}

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: string;
  answers: IUserAnswer[];
  score: number; // Percentage (0-100)
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // Total time in seconds
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserAnswerSchema = new Schema<IUserAnswer>({
  questionIndex: { type: Number, required: true },
  selectedAnswer: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
  timeSpent: { type: Number }
});

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    userId: { type: String, required: true },
    answers: [UserAnswerSchema],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const QuizAttemptModel: Model<IQuizAttempt> =
  mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", QuizAttemptSchema);

export default QuizAttemptModel;
