"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState, useEffect, useCallback } from "react";

interface LeftPanelProps {
  id: string;
  activeVideoTab: string;
  setActiveVideoTab: (value: string) => void;
}

interface TranscriptSegment {
  time: string;
  text: string;
}

export default function LeftPanel({
  id,
  activeVideoTab,
  setActiveVideoTab,
}: LeftPanelProps) {
  // const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  // const [currentThumbnail, setCurrentThumbnail] = useState(thumbnailUrl);
  const [youtube_id, setYoutube_id] = useState("");

  // Transcript parser function
  const parseTranscript = (
    rawTranscript: TranscriptSegment[]
  ): TranscriptSegment[] => {
    return rawTranscript.map((segment) => ({
      ...segment,
      text: segment.text.replace(/&amp;#39;/g, "'"), // Replace all occurrences of &amp;#39; with '
    }));
  };

  const fetchTranscriptAndVideoDetails = useCallback(async () => {
    try {
      const res = await fetch(`/api/contents?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch video details");
      const data = await res.json();
      setYoutube_id(data.youtube_id);
      // setCurrentThumbnail(data.thumbnailUrl);

      // Parse and set the transcript
      const parsedTranscript = parseTranscript(data.transcript);
      setTranscript(parsedTranscript);
    } catch (error) {
      console.error("Error fetching transcript and video details:", error);
    }
  }, [id]);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch(`/api/contents?id=${id}`); // Replace with the actual chapters route
      if (!res.ok) throw new Error("Failed to fetch chapters");
      await res.json();
      // setChapters(data.chapters); // Assuming chapters are part of the API response
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  }, [id]);

  useEffect(() => {
    // Fetch transcript and video details on mount
    fetchTranscriptAndVideoDetails();
  }, [id, fetchTranscriptAndVideoDetails]);

  useEffect(() => {
    if (activeVideoTab === "chapters") {
      // Fetch chapters when switching to the chapters tab
      fetchChapters();
    }
  }, [activeVideoTab, fetchChapters]);

  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4 min-h-0">
      <ResizablePanelGroup
        direction="vertical"
        className="w-full h-full rounded-lg border flex-1 min-h-0"
      >
        {/* Video Panel */}
        <ResizablePanel
          defaultSize={18}
          minSize={10}
          maxSize={50}
          className="min-h-0 h-fit w-auto"
        >
          <div className="aspect-video rounded-lg overflow-hidden bg-black h-fit w-auto">
            {/* Render YouTube iframe if video is playing */}
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${youtube_id}`}
              title="Video Player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </ResizablePanel>

        <ResizableHandle className="hidden md:flex my-2" />

        {/* Chapters/Transcript Panel (hidden on mobile) */}
        <ResizablePanel
          defaultSize={30}
          minSize={10}
          maxSize={70}
          className="hidden md:flex flex-col min-h-0 flex-1"
        >
          <Tabs
            value={activeVideoTab}
            onValueChange={setActiveVideoTab}
            className="w-full h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="transcript" className="w-full">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent
              value="transcript"
              className="flex-1 min-h-0 overflow-hidden"
            >
              <ScrollArea className="h-full">
                {transcript.map((segment, index) => (
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
