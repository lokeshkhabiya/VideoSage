"use client";

import { useState } from "react";
import useIsMobile from "@/hooks/useIsMobile";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import LeftPanel from "./LeftPanel";
import RightPanel from "./RightPanel";

/**
 * (Optional) If you moved dummy data to "dummyData.ts",
 * import it here. Otherwise, keep them in this file as you originally had.
 */
import {
  dummyChatMessages,
  dummyFlashcards,
  dummySummary,
  dummyTakeaways,
  dummyQuiz,
  dummyMindMap,
} from "./dummyData";

interface ContentPageProps {
  id: string; // from useParams
}

export default function ContentPage({ id }: ContentPageProps) {
  const isMobile = useIsMobile();

  const [activeMainTab, setActiveMainTab] = useState("chat");
  const [activeVideoTab, setActiveVideoTab] = useState("transcript");
  const [chatInput, setChatInput] = useState("");
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number>
  >({});

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      // TODO: handle sending the chat message
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
    <div className="flex flex-col h-full bg-background">
      {/* Main resizable area */}
      <div className="flex-1 min-h-0 p-2">
        <ResizablePanelGroup
          // Switch between "vertical" on mobile, "horizontal" on desktop
          direction={isMobile ? "vertical" : "horizontal"}
          className="w-full h-full rounded-lg border flex-1 min-h-0"
        >
          <div className="flex w-full h-full flex-col md:flex-row min-h-0">
            {/* ---- LEFT PANEL (Video & Chapters) ---- */}
            <ResizablePanel
              defaultSize={30}
              minSize={20}
              maxSize={60}
              className="flex flex-col min-h-0"
            >
              <LeftPanel
                id={id}
                activeVideoTab={activeVideoTab}
                setActiveVideoTab={setActiveVideoTab}
              />
            </ResizablePanel>

            <ResizableHandle className="flex" />

            {/* ---- RIGHT PANEL (Tabs) ---- */}
            <ResizablePanel
              defaultSize={60}
              minSize={40}
              className="flex flex-col min-h-0"
            >
              <RightPanel
                activeMainTab={activeMainTab}
                setActiveMainTab={setActiveMainTab}
                chatInput={chatInput}
                setChatInput={setChatInput}
                handleChatSubmit={handleChatSubmit}
                dummyChatMessages={dummyChatMessages}
                dummyQuiz={dummyQuiz}
                selectedAnswers={selectedAnswers}
                handleAnswerSelect={handleAnswerSelect}
                dummyFlashcards={dummyFlashcards}
                currentFlashcard={currentFlashcard}
                setCurrentFlashcard={setCurrentFlashcard}
                isFlipped={isFlipped}
                setIsFlipped={setIsFlipped}
                dummySummary={dummySummary}
                dummyTakeaways={dummyTakeaways}
                dummyMindMap={dummyMindMap}
              />
            </ResizablePanel>
          </div>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
