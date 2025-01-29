"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useState, useEffect } from "react";
import { Play } from "lucide-react";

interface LeftPanelProps {
  id: string;
  activeVideoTab: string;
  setActiveVideoTab: (value: string) => void;
  dummyChapters: {
    time: string;
    duration: string;
    title: string;
    description: string;
  }[];
  thumbnailUrl: string;
}

interface TranscriptSegment {
  time: string;
  text: string;
}

export default function LeftPanel({
  id,
  activeVideoTab,
  setActiveVideoTab,
  dummyChapters,
  thumbnailUrl,
}: LeftPanelProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [chapters, setChapters] = useState(dummyChapters);
  const [currentThumbnail, setCurrentThumbnail] = useState(thumbnailUrl);
  const [_, setYoutubeUrl] = useState("");
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

  const fetchTranscriptAndVideoDetails = async () => {
    try {
      const res = await fetch(`/api/contents?id=${id}`);
      if (!res.ok) throw new Error("Failed to fetch video details");
      const data = await res.json();
      setYoutubeUrl(data.youtubeUrl);
      setYoutube_id(data.youtube_id);
      setCurrentThumbnail(data.thumbnailUrl);

      // Parse and set the transcript
      const parsedTranscript = parseTranscript(data.transcript);
      setTranscript(parsedTranscript);
    } catch (error) {
      console.error("Error fetching transcript and video details:", error);
    }
  };

  const fetchChapters = async () => {
    try {
      const res = await fetch(`/api/contents?id=${id}`); // Replace with the actual chapters route
      if (!res.ok) throw new Error("Failed to fetch chapters");
      const data = await res.json();
      // setChapters(data.chapters); // Assuming chapters are part of the API response
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
  };

  const handlePlayVideo = () => {
    setIsVideoPlaying(true);
  };

  useEffect(() => {
    // Fetch transcript and video details on mount
    fetchTranscriptAndVideoDetails();
  }, [id]);

  useEffect(() => {
    if (activeVideoTab === "chapters") {
      // Fetch chapters when switching to the chapters tab
      fetchChapters();
    }
  }, [activeVideoTab]);

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
            {isVideoPlaying ? (
              // Render YouTube iframe if video is playing
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${youtube_id}`}
                title="Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            ) : (
              // Render thumbnail with play button
              <div
                className="relative w-full h-full cursor-pointer rounded-lg"
                onClick={handlePlayVideo}
              >
                <img
                  src={currentThumbnail}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover"
                />
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                  <button
                    className="text-white text-4xl bg-gray-800 p-4 rounded-full shadow-lg border-white border"
                    aria-label="Play Video"
                  >
                    <Play className="fill-white" />
                  </button>
                </div>
              </div>
            )}
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent
              value="chapters"
              className="flex-1 min-h-0 overflow-hidden"
            >
              <ScrollArea className="h-full">
                {chapters.map((chapter, index) => (
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
