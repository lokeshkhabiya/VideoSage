"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useSpaces } from "@/hooks/space-provider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/auth-provider";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_option: string;
  explanation: string;
  timestamp: string;
}

interface QuizTabProps {
  value: string;
  activeMainTab: string;
}

export default function QuizTab({
  value,
  activeMainTab,
}: QuizTabProps) {
  const { id } = useParams();
  const { spaces } = useSpaces();
  const [isLoading, setIsLoading] = useState(false);
  const [youtube_id, setYoutubeId] = useState<string>("");
  const [content_id, setContentId] = useState<string>("");
  const [quizData, setQuizData] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const { user } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    // Find the content across all spaces
    for (const space of spaces) {
      const content = space.contents?.find(content => content.id === id);
      if (content) {
        setYoutubeId(content.youtube_id);
        setContentId(content.id);
        break;
      }
    }

    if (youtube_id && content_id) {
      async function fetchData() {
        try {
          const response = await axios.get(`/api/generate/quiz?video_id=${youtube_id}&content_id=${content_id}`, {
            headers: {
              authorization: user?.token
            }
          });
// @ts-ignore
          if (response?.data?.data?.questions) {
            // @ts-ignore
            setQuizData(response.data.data.questions);
          }
        } catch (error) {
          console.log("error while getting quiz: ", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }
  }, [spaces, id, youtube_id, content_id]);

  const handleAnswerSelect = (qIndex: number, oIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qIndex]: oIndex
    }));
  };

  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col min-h-0">
          <ScrollArea className="p-6 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {quizData.map((question, qIndex) => (
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
                    {selectedAnswers[qIndex] !== undefined && 
                      question.options[selectedAnswers[qIndex]] === question.correct_option && (
                      <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Correct! {question.explanation}
                        </p>
                      </div>
                    )}
                    {selectedAnswers[qIndex] !== undefined &&
                      question.options[selectedAnswers[qIndex]] !== question.correct_option && (
                      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                        <p className="text-sm text-red-600 dark:text-red-400">
                          Try again! Review the related section in the video at {question.timestamp}.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </TabsContent>
  );
}
