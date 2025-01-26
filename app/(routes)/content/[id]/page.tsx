"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  MessageSquare,
  FileText,
  Network,
  Send,
  RotateCcw,
  ChevronRight,
  Lightbulb,
  Layers,
} from "lucide-react";

export default function ContentPage() {
  const { id } = useParams();
  const [activeMainTab, setActiveMainTab] = useState("chat");
  const [activeVideoTab, setActiveVideoTab] = useState("chapters");
  const [chatInput, setChatInput] = useState("");
  const [isLearningMode, setIsLearningMode] = useState(false);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      // Handle chat submission
      setChatInput("");
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  return (
    <div className="max-h-full bg-background">
      <div className="h-full">
        <ResizablePanelGroup
          direction="horizontal"
          className="max-h-full w-full rounded-lg border flex-1"
        >
          {/* Left Panel - Video and Chapters/Transcript */}
          <ResizablePanel defaultSize={40} minSize={30} maxSize={60}>
            <div className="h-full p-4 space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/676A6DaYzho"
                  title="MongoDB Tutorial"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>

              <div className="hidden md:block h-full">
                <Tabs
                  value={activeVideoTab}
                  onValueChange={setActiveVideoTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="chapters">Chapters</TabsTrigger>
                    <TabsTrigger value="transcript">Transcript</TabsTrigger>
                  </TabsList>
                  <TabsContent value="chapters" className="mt-4 h-full">
                    <ScrollArea className="h-full">
                      {dummyChapters.map((chapter, index) => (
                        <div
                          key={index}
                          className="flex flex-col space-y-2 p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {chapter.time}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {chapter.duration}
                            </span>
                          </div>
                          <h3 className="font-medium">{chapter.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {chapter.description}
                          </p>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="transcript" className="mt-4">
                    <ScrollArea className="h-full">
                      {dummyTranscript.map((segment, index) => (
                        <div
                          key={index}
                          className="flex space-x-4 p-4 hover:bg-muted/50 rounded-lg cursor-pointer"
                        >
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            {segment.time}
                          </span>
                          <p className="text-sm">{segment.text}</p>
                        </div>
                      ))}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle className="hidden md:flex" />

          {/* Right Panel - Interactive Content */}
          <ResizablePanel defaultSize={60}>
            <div className="h-full p-4">
              <Tabs
                defaultValue={activeMainTab}
                onValueChange={setActiveMainTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
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

                <TabsContent value="chat" className="mt-4">
                  <Card className="h-full flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm">
                            Welcome to the chat! Ask me anything. I may not
                            always be right, but your feedback will help me
                            improve!
                          </p>
                        </div>
                        {dummyChatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <form
                        onSubmit={handleChatSubmit}
                        className="flex space-x-2"
                      >
                        <div className="flex-1">
                          <Input
                            placeholder="Ask anything..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                          />
                        </div>
                        <Button type="submit" size="icon">
                          <Send className="h-4 w-4" />
                          <span className="sr-only">Send message</span>
                        </Button>
                      </form>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="quiz" className="mt-4">
                  <Card className="h-[600px]">
                    <ScrollArea className="h-full p-6">
                      <div className="space-y-8">
                        {dummyQuiz.map((question, qIndex) => (
                          <div key={qIndex} className="space-y-4">
                            <h3 className="font-medium">
                              {qIndex + 1}. {question.question}
                            </h3>
                            <div className="grid gap-2">
                              {question.options.map((option, oIndex) => (
                                <Button
                                  key={oIndex}
                                  variant={
                                    selectedAnswers[qIndex] === oIndex
                                      ? "default"
                                      : "outline"
                                  }
                                  className="justify-start"
                                  onClick={() =>
                                    handleAnswerSelect(qIndex, oIndex)
                                  }
                                >
                                  <span className="mr-2">
                                    {String.fromCharCode(65 + oIndex)}.
                                  </span>
                                  {option}
                                </Button>
                              ))}
                            </div>
                            {selectedAnswers[qIndex] ===
                              question.correctAnswer && (
                              <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  Correct! {question.explanation}
                                </p>
                              </div>
                            )}
                            {selectedAnswers[qIndex] !== undefined &&
                              selectedAnswers[qIndex] !==
                                question.correctAnswer && (
                                <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                                  <p className="text-sm text-red-600 dark:text-red-400">
                                    Try again! Review the related section in the
                                    video.
                                  </p>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>

                <TabsContent value="flashcards" className="mt-4">
                  <Card className="h-[600px]">
                    <div className="p-4 space-y-4">
                      <div className="relative h-[400px] perspective-1000">
                        <div
                          className={`absolute inset-0 duration-500 preserve-3d cursor-pointer ${
                            isFlipped ? "[transform:rotateY(180deg)]" : ""
                          }`}
                          onClick={() => setIsFlipped(!isFlipped)}
                        >
                          <div className="absolute inset-0 backface-hidden rounded-xl border bg-card p-6">
                            <div className="flex h-full flex-col items-center justify-center text-center">
                              <p className="text-xl font-medium">
                                {dummyFlashcards[currentFlashcard].front}
                              </p>
                              <p className="mt-2 text-sm text-muted-foreground">
                                Click to reveal answer
                              </p>
                            </div>
                          </div>
                          <div className="absolute inset-0 [transform:rotateY(180deg)] backface-hidden rounded-xl border bg-card p-6">
                            <div className="flex h-full flex-col items-center justify-center text-center">
                              <p className="text-lg">
                                {dummyFlashcards[currentFlashcard].back}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentFlashcard(
                              (prev) => (prev + 1) % dummyFlashcards.length
                            );
                          }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="text-sm text-muted-foreground">
                          Card {currentFlashcard + 1} of{" "}
                          {dummyFlashcards.length}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentFlashcard(0);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="summary" className="mt-4">
                  <Card className="h-[600px]">
                    <ScrollArea className="h-full p-6">
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h2 className="text-xl font-semibold">Overview</h2>
                          {dummySummary.map((paragraph, index) => (
                            <p
                              key={index}
                              className="text-sm text-muted-foreground leading-relaxed"
                            >
                              {paragraph}
                            </p>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <h2 className="text-xl font-semibold">
                            Key Takeaways
                          </h2>
                          <ul className="list-disc space-y-2 pl-4">
                            {dummyTakeaways.map((takeaway, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                {takeaway}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </ScrollArea>
                  </Card>
                </TabsContent>

                <TabsContent value="mindmap" className="mt-4">
                  <Card className="h-[600px]">
                    <div className="h-full p-6">
                      <div className="relative h-full rounded-lg border bg-white dark:bg-gray-900">
                        <svg
                          className="h-full w-full"
                          viewBox="0 0 800 600"
                          style={{
                            fontFamily: "system-ui, sans-serif",
                            fontSize: "14px",
                          }}
                        >
                          {/* Central Node */}
                          <g transform="translate(400,300)">
                            <circle r="60" fill="hsl(var(--primary))" />
                            <text
                              textAnchor="middle"
                              fill="hsl(var(--primary-foreground))"
                              dy=".3em"
                            >
                              MongoDB
                            </text>

                            {/* Branches */}
                            {dummyMindMap.map((branch, index) => {
                              const angle =
                                (index * 2 * Math.PI) / dummyMindMap.length;
                              const x = Math.cos(angle) * 150;
                              const y = Math.sin(angle) * 150;

                              return (
                                <g key={index}>
                                  <line
                                    x1="0"
                                    y1="0"
                                    x2={x}
                                    y2={y}
                                    stroke="hsl(var(--border))"
                                    strokeWidth="2"
                                  />
                                  <circle
                                    cx={x}
                                    cy={y}
                                    r="40"
                                    fill="hsl(var(--muted))"
                                  />
                                  <text
                                    x={x}
                                    y={y}
                                    textAnchor="middle"
                                    fill="currentColor"
                                    dy=".3em"
                                  >
                                    {branch.title}
                                  </text>

                                  {/* Sub-branches */}
                                  {branch.subtopics.map((subtopic, sIndex) => {
                                    const subAngle =
                                      angle + ((sIndex - 1) * Math.PI) / 6;
                                    const subX = x + Math.cos(subAngle) * 100;
                                    const subY = y + Math.sin(subAngle) * 100;

                                    return (
                                      <g key={`${index}-${sIndex}`}>
                                        <line
                                          x1={x}
                                          y1={y}
                                          x2={subX}
                                          y2={subY}
                                          stroke="hsl(var(--border))"
                                          strokeWidth="1"
                                        />
                                        <circle
                                          cx={subX}
                                          cy={subY}
                                          r="30"
                                          fill="hsl(var(--accent))"
                                        />
                                        <text
                                          x={subX}
                                          y={subY}
                                          textAnchor="middle"
                                          fill="currentColor"
                                          dy=".3em"
                                          fontSize="12"
                                        >
                                          {subtopic}
                                        </text>
                                      </g>
                                    );
                                  })}
                                </g>
                              );
                            })}
                          </g>
                        </svg>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

const dummyChapters = [
  {
    time: "00:00",
    duration: "5:00",
    title: "Introduction to MongoDB",
    description: "Overview of MongoDB and its key features",
  },
  {
    time: "05:00",
    duration: "10:00",
    title: "Document Model & BSON",
    description: "Understanding MongoDB's document model and BSON format",
  },
  {
    time: "15:00",
    duration: "15:00",
    title: "CRUD Operations",
    description: "Creating, reading, updating, and deleting documents",
  },
];

const dummyTranscript = [
  {
    time: "0:00",
    text: "Welcome to this comprehensive MongoDB tutorial. Today we'll cover everything from basic concepts to advanced features.",
  },
  {
    time: "1:30",
    text: "MongoDB is a document database with the scalability and flexibility that you want with the querying and indexing that you need.",
  },
  {
    time: "3:45",
    text: "Let's start by understanding what makes MongoDB different from traditional relational databases.",
  },
];

const dummyChatMessages = [
  {
    role: "user",
    content: "What are the main advantages of MongoDB?",
  },
  {
    role: "assistant",
    content:
      "MongoDB offers several key advantages: 1) Flexible schema design, 2) Horizontal scalability, 3) High performance for large amounts of data, and 4) Native support for modern data types.",
  },
];

const dummyFlashcards = [
  {
    front: "What is MongoDB?",
    back: "MongoDB is a document-oriented NoSQL database that stores data in flexible, JSON-like documents.",
  },
  {
    front: "What is BSON?",
    back: "BSON (Binary JSON) is the binary-encoded serialization of JSON-like documents that MongoDB uses for storing documents.",
  },
];

const dummySummary = [
  "This MongoDB tutorial provides a comprehensive introduction to one of the most popular NoSQL databases. The video covers fundamental concepts, practical implementations, and best practices for working with MongoDB.",
  "Throughout the tutorial, we explore the document-based data model, CRUD operations, indexing strategies, and advanced features that make MongoDB a powerful choice for modern applications.",
];

const dummyTakeaways = [
  "MongoDB uses a flexible, document-based data model",
  "No schema is required before inserting data",
  "Supports rich queries and indexing",
  "Built-in support for horizontal scaling",
  "Ideal for applications with evolving data structures",
];

const dummyQuiz = [
  {
    question: "What is the primary data structure in MongoDB?",
    options: ["Table", "Document", "Graph", "Key-Value Pair"],
    correctAnswer: 1,
    explanation: "MongoDB stores data in flexible, JSON-like documents.",
  },
  {
    question: "What does BSON stand for?",
    options: [
      "Binary JSON",
      "Basic Object Serialization",
      "Block Object Storage",
      "Boolean Object Notation",
    ],
    correctAnswer: 0,
    explanation:
      "BSON (Binary JSON) is the binary-encoded serialization of JSON-like documents.",
  },
];

const dummyMindMap = [
  {
    title: "Core Concepts",
    subtopics: ["Documents", "Collections", "Databases"],
  },
  {
    title: "CRUD Operations",
    subtopics: ["Insert", "Find", "Update", "Delete"],
  },
  {
    title: "Advanced Features",
    subtopics: ["Aggregation", "Transactions", "Sharding"],
  },
];
