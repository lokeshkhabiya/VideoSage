"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";

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
  dummyTranscript: {
    time: string;
    text: string;
  }[];
}

export default function LeftPanel({
  id,
  activeVideoTab,
  setActiveVideoTab,
  dummyChapters,
  dummyTranscript,
}: LeftPanelProps) {
  return (
    <div className="w-full h-full p-4 flex flex-col space-y-4 min-h-0">
      <ResizablePanelGroup
        direction="vertical"
        className="w-full h-full rounded-lg border flex-1 min-h-0"
      >
        {/* Video Panel */}
        <ResizablePanel
          defaultSize={15}
          minSize={10}
          maxSize={50}
          className="min-h-0 h-fit w-auto"
        >
          <div className="aspect-video rounded-lg overflow-hidden bg-black h-fit w-auto">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${id}`}
              title="MongoDB Tutorial"
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chapters">Chapters</TabsTrigger>
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
            </TabsList>

            <TabsContent
              value="chapters"
              className="flex-1 min-h-0 overflow-hidden"
            >
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

            <TabsContent
              value="transcript"
              className="flex-1 min-h-0 overflow-hidden"
            >
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
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
