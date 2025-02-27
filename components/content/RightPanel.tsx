"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatTab from "./ChatTab";
import QuizTab from "./QuizTab";
import FlashcardsTab from "./FlashcardsTab";
import SummaryTab from "./SummaryTab";
import MindMapTab from "./MindMapTab";

import {
  MessageSquare,
  Lightbulb,
  Layers,
  FileText,
  Network,
} from "lucide-react";

interface RightPanelProps {
  activeMainTab: string;
  setActiveMainTab: (value: string) => void;

  // Chat
  chatInput: string;
  setChatInput: (value: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  dummyChatMessages: { role: string; content: string }[];

  // Quiz
  dummyQuiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  selectedAnswers: Record<number, number>;
  handleAnswerSelect: (qIndex: number, oIndex: number) => void;

  // Flashcards
  dummyFlashcards: { front: string; back: string }[];
  currentFlashcard: number;
  setCurrentFlashcard: (val: number) => void;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;

  // Summary
  dummySummary: string[];
  dummyTakeaways: string[];

  // MindMap
  dummyMindMap: {
    title: string;
    subtopics: string[];
  }[];
}

export default function RightPanel({
  activeMainTab,
  setActiveMainTab,
}: RightPanelProps) {
  return (
    <div className="h-full w-full p-4 flex flex-col min-h-0">
      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className="w-full h-full flex flex-col"
      >
        <TabsList className="grid w-full grid-cols-5 overflow-auto">
          <TabsTrigger value="chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="quiz">
            <Lightbulb className="h-4 w-4 mr-2" />
            Quiz
          </TabsTrigger>
          <TabsTrigger value="flashcards">
            <Layers className="h-4 w-4 mr-2" />
            Flashcards
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="mindmap">
            <Network className="h-4 w-4 mr-2" />
            Mind Map
          </TabsTrigger>
        </TabsList>

        <ChatTab
          value="chat"
        />

        <QuizTab
          value="quiz"
          activeMainTab={activeMainTab}
        />

        <FlashcardsTab
          value="flashcards"
          activeMainTab={activeMainTab}
        />

        <SummaryTab
          value="summary"
          activeMainTab={activeMainTab}
        />

        <MindMapTab
          value="mindmap"
          activeMainTab={activeMainTab}
        />
      </Tabs>
    </div>
  );
}
