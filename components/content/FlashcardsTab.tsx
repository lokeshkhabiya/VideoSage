"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, ChevronRight } from "lucide-react";

interface FlashcardsTabProps {
  value: string;
  activeMainTab: string;
  dummyFlashcards: { front: string; back: string }[];
  currentFlashcard: number;
  setCurrentFlashcard: React.Dispatch<React.SetStateAction<number>>;
  isFlipped: boolean;
  setIsFlipped: (val: boolean) => void;
}

export default function FlashcardsTab({
  value,
  activeMainTab,
  dummyFlashcards,
  currentFlashcard,
  setCurrentFlashcard,
  isFlipped,
  setIsFlipped,
}: FlashcardsTabProps) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col p-4 min-h-0">
          <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
            <div className="relative flex-1 perspective-1000">
              <div
                className={`absolute inset-0 duration-500 preserve-3d cursor-pointer ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="absolute inset-0 backface-hidden rounded-xl border bg-card p-6 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xl font-medium">
                      {dummyFlashcards[currentFlashcard].front}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Click to reveal answer
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 [transform:rotateY(180deg)] backface-hidden rounded-xl border bg-card p-6 flex items-center justify-center">
                  <p className="text-lg">
                    {dummyFlashcards[currentFlashcard].back}
                  </p>
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
                Card {currentFlashcard + 1} of {dummyFlashcards.length}
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
      )}
    </TabsContent>
  );
}
