"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface QuizTabProps {
  value: string;
  activeMainTab: string;
  dummyQuiz: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
  selectedAnswers: Record<number, number>;
  handleAnswerSelect: (qIndex: number, oIndex: number) => void;
}

export default function QuizTab({
  value,
  activeMainTab,
  dummyQuiz,
  selectedAnswers,
  handleAnswerSelect,
}: QuizTabProps) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col min-h-0">
          <ScrollArea className="p-6 flex-1">
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
                        onClick={() => handleAnswerSelect(qIndex, oIndex)}
                      >
                        <span className="mr-2">
                          {String.fromCharCode(65 + oIndex)}.
                        </span>
                        {option}
                      </Button>
                    ))}
                  </div>
                  {selectedAnswers[qIndex] === question.correctAnswer && (
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Correct! {question.explanation}
                      </p>
                    </div>
                  )}
                  {selectedAnswers[qIndex] !== undefined &&
                    selectedAnswers[qIndex] !== question.correctAnswer && (
                      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Try again! Review the related section in the video.
                        </p>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </TabsContent>
  );
}
