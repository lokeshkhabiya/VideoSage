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
interface ContentPageProps {
  id: string;
}

export default function ContentPage({ id }: ContentPageProps) {
  const isMobile = useIsMobile();

  const [activeMainTab, setActiveMainTab] = useState("chat");
  const [activeVideoTab, setActiveVideoTab] = useState("transcript");

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

            <ResizablePanel
              defaultSize={60}
              minSize={40}
              className="flex flex-col min-h-0"
            >
              <RightPanel
                activeMainTab={activeMainTab}
                setActiveMainTab={setActiveMainTab}
              />
            </ResizablePanel>
          </div>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
