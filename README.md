# StudyStack - AI-Powered Learning Management System

A modern web application that integrates with external APIs to create a comprehensive learning experience. Students can search for learning resources, save content, track progress, and generate AI-powered quizzes.

## 🚀 Features

- **Resource Management**: Add, organize, and track learning resources (YouTube videos, web pages, documents)
- **Learning Progress**: Track your study progress with visual indicators and status updates
- **AI Quiz Generation**: Generate customized quizzes based on your study resources using OpenAI
- **Community Sharing**: Share study stacks publicly or keep them private
- **User Authentication**: Secure authentication and session management with Clerk
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (React 19), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (Node.js)
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **AI Integration**: OpenAI API with LangChain
- **UI Components**: shadcnUI, Radix UI primitives

## 📋 Prerequisites

- Node.js 20+ 
- MongoDB database (local or Atlas)
- Clerk account for authentication
- OpenAI API key

## ⚙️ Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=studystack

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd study-mode
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your API keys and database connection string

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/            # Next.js app router
│   ├── api/v1/     # API endpoints
│   ├── stacks/     # Stack pages
│   └── page.tsx    # Home page
├── components/     # Reusable UI components
├── lib/            # Utilities and configurations
├── models/         # MongoDB schemas
└── types/          # TypeScript type definitions
```

## 🎯 How to Use

1. **Sign up/Login** using the authentication system
2. **Create a Study Stack** by clicking "Create New Stack" on the dashboard. Or, you can copy the others' Stacks in Community Stacks.
3. **Add Resources** to your stack (YouTube videos, web pages, documents)
4. **Track Learning Progress** by updating resource statuses (todo, in progress, done)
5. **Generate AI Quizzes** based on your study resources
6. **Take Quizzes** and review your performance
7. **Share Stacks** publicly for community access

## 🔧 API Endpoints

### Stacks
- `GET    /api/v1/stacks` - Get all stacks with resource counts
- `POST   /api/v1/stacks` - Create a new stack
- `GET    /api/v1/stacks/:stackId` - Get specific stack
- `PUT    /api/v1/stacks/:stackId` - Update stack
- `DELETE /api/v1/stacks/:stackId` - Delete stack
- `POST   /api/v1/stacks/:stackId/copy` - Copy a public stack

### Resources
- `GET    /api/v1/stacks/:stackId/resources` - Get resources for a stack
- `POST   /api/v1/stacks/:stackId/resources` - Add resource to stack
- `PUT    /api/v1/stacks/:stackId/resources/:resourceId` - Update resource
- `DELETE /api/v1/stacks/:stackId/resources/:resourceId` - Delete resource

### Quizzes
- `GET    /api/v1/stacks/:stackId/quizzes` - Get quizzes for a stack
- `POST   /api/v1/stacks/:stackId/quizzes` - Create AI-generated quiz
- `GET    /api/v1/stacks/:stackId/quizzes/:quizId` - Get specific quiz
- `DELETE /api/v1/stacks/:stackId/quizzes/:quizId` - Delete quiz

### Quiz Attempts
- `POST /api/v1/stacks/:stackId/quizzes/:quizId/attempts` - Submit quiz attempt
- `GET  /api/v1/stacks/:stackId/quizzes/:quizId/attempts` - Get user's attempts

## 🤖 AI Features

- **Smart Quiz Generation**: Creates contextual multiple-choice questions from your study resources
- **Higher Order Thinking Skills (HOTS)**: Option to generate advanced analytical questions
- **Structured Output**: Uses LangChain for consistent, reliable AI responses

## 🔒 Security Features

- User ownership validation for all operations
- API key protection
- Private/public access controls

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)
```bash
npx vercel
```

Make sure to set environment variables in your deployment platform.



## 📁 Sample Test Data

Here are two JSON files containing sample data for the stacks and resources collections. This data can be used for demonstration purposes. Please note, the _id and ownerId values are hardcoded for easy setup.

- `src/app/db_seeds/stacks.json`
- `src/app/db_seeds/resources.json`

