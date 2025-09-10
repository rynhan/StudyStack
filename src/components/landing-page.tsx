"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SignUpButton } from '@clerk/nextjs'
import { BookOpen, Brain, Users, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center">
      
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-6xl">📚</span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
              StudyStacks
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Organize your study resources, track your learning progress, and generate AI-powered quizzes to master any subject
          </p>
          
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              Get Started
            </Button>
          </SignUpButton>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Organize Resources</h3>
            <p className="text-gray-600 text-sm">
              Collect and organize all your study materials in one place
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-gray-600 text-sm">
              Monitor your learning journey with visual progress tracking
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">AI-Powered Quizzes</h3>
            <p className="text-gray-600 text-sm">
              Generate intelligent quizzes from your study materials
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Share & Collaborate</h3>
            <p className="text-gray-600 text-sm">
              Share your study stacks with the community
            </p>
          </Card>
        </div>
      </section>

    </main>
  )
}
