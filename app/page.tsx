"use client"

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, PlayCircle, FileText, Zap, BrainCircuit, MessageSquare, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-gray-900 [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-30"></div>
      
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/videosage-logo.png"
              alt="VideoSage Logo" 
              width={80} 
              height={80}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-gray-800 dark:text-white">VideoSage</span>
          </Link>
          <div className="flex items-center space-x-8">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4">
        <motion.section 
          className="py-20 text-center relative"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <motion.h1 
            className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Unlock the Power of Video Learning
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            VideoSage transforms your YouTube learning experience with AI-powered tools for better understanding and interaction.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="flex space-x-4 justify-center">
              <Link 
                href="/signup"
                className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
              >
                Sign Up
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                href="/signin"
                className="inline-flex items-center px-6 py-3 text-lg font-semibold text-gray-800 dark:text-white bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all hover:scale-105 active:scale-95"
              >
                Sign In
              </Link>
            </div>
          </motion.div>
        </motion.section>

        <motion.section 
          id="features" 
          className="py-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-12 text-center">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 cursor-pointer">
            {[
              {
                icon: MessageSquare,
                title: "Interactive Video Chat",
                description: "Engage in real-time conversations with AI about video content. Ask questions, get explanations, and deepen your understanding.",
                color: "bg-blue-500/10 dark:bg-blue-500/20"
              },
              {
                icon: FileText,
                title: "Smart Summaries",
                description: "Get concise, accurate summaries of any video. Save time while capturing key insights and main points.",
                color: "bg-purple-500/10 dark:bg-purple-500/20"
              },
              {
                icon: BrainCircuit,
                title: "AI Mind Mapping",
                description: "Visualize video concepts with automatically generated mind maps. Connect ideas and understand relationships better.",
                color: "bg-green-500/10 dark:bg-green-500/20"
              },
              {
                icon: Zap,
                title: "Quick Flashcards",
                description: "Generate study aids instantly from video content. Review and retain information more effectively.",
                color: "bg-yellow-500/10 dark:bg-yellow-500/20"
              },
              {
                icon: Sparkles,
                title: "Custom Learning Paths",
                description: "Get personalized learning recommendations based on your interests and learning style.",
                color: "bg-pink-500/10 dark:bg-pink-500/20"
              },
              {
                icon: PlayCircle,
                title: "Smart Playback",
                description: "Navigate videos efficiently with AI-powered timestamps and chapter markers.",
                color: "bg-orange-500/10 dark:bg-orange-500/20"
              },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className={`p-6 rounded-xl ${feature.color} backdrop-blur-sm transform transition-all duration-500 ease-in-out hover:scale-110 hover:shadow-xl`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <feature.icon className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section 
          className="py-20 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Ready to Enhance Your Learning?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Join VideoSage today and transform the way you learn from YouTube videos.
          </p>
          <Link 
            href="/signup"
            className="inline-flex items-center px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            Try VideoSage for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.section>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 dark:text-gray-400">
        <p>&copy; {new Date().getFullYear()} VideoSage. All rights reserved.</p>
      </footer>
    </div>
  )
}

