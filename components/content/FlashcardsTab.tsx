"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronRight } from "lucide-react";
import { useSpaces } from "@/hooks/space-provider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/auth-provider";

interface Flashcard {
  question: string;
  hint: string;
  answer: string;
  explanation: string;
  source: string;
}

interface FlashcardsTabProps {
  value: string;
  activeMainTab: string;
}

export default function FlashcardsTab({
  value,
  activeMainTab,
}: FlashcardsTabProps) {
  const { id } = useParams();
  const { spaces } = useSpaces();
  const [isLoading, setIsLoading] = useState(false);
  const [youtube_id, setYoutubeId] = useState<string>("");
  const [content_id, setContentId] = useState<string>("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
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
          const response = await axios.get(`/api/generate/flashcard?video_id=${youtube_id}&content_id=${content_id}`, {
            headers: {
              authorization: user?.token
            }
          });
          
          // @ts-ignore
          if (response?.data?.data?.flashcards) {
            // @ts-ignore
            setFlashcards(response.data.data.flashcards);
          }
        } catch (error) {
          console.log("error while getting flashcards: ", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }
  }, [spaces, id, youtube_id, content_id]);

  const resetCard = () => {
    setShowHint(false);
    setShowAnswer(false);
    setShowExplanation(false);
  };

  const nextCard = () => {
    resetCard();
    setCurrentFlashcard((prev) => (prev + 1) % flashcards.length);
  };

  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col p-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
              <div className="relative flex-1">
                {flashcards.length > 0 && (
                  <div className="relative w-full h-full">
                    <div 
                      className={`absolute inset-0 rounded-xl border bg-card p-6 transition-all duration-500 ${
                        showAnswer ? "[transform:rotateY(180deg)] pointer-events-none" : ""
                      }`}
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden"
                      }}
                      onClick={() => !showAnswer && setShowAnswer(true)}
                    >
                      <div className="text-center space-y-4">
                        <p className="text-xl font-medium">
                          {flashcards[currentFlashcard].question}
                        </p>
                        
                        <Button 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowHint(true);
                          }}
                        >
                          Show Hint
                        </Button>

                        {showHint && (
                          <p className="text-sm text-muted-foreground">
                            {flashcards[currentFlashcard].hint}
                          </p>
                        )}
                      </div>
                    </div>

                    <div 
                      className={`absolute inset-0 rounded-xl border bg-card p-6 transition-all duration-500 [transform:rotateY(-180deg)] ${
                        showAnswer ? "[transform:rotateY(0deg)]" : "pointer-events-none"
                      }`}
                      style={{
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden"
                      }}
                    >
                      <div className="text-center space-y-4">
                        <p className="text-lg">
                          {flashcards[currentFlashcard].answer}
                        </p>
                        
                        <Button
                          variant="outline"
                          onClick={() => setShowExplanation(true)}
                        >
                          Show Explanation
                        </Button>

                        {showExplanation && (
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              {flashcards[currentFlashcard].explanation}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Source: {flashcards[currentFlashcard].source}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextCard}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  Card {currentFlashcard + 1} of {flashcards.length}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    resetCard();
                    setCurrentFlashcard(0);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </TabsContent>
  );
}
