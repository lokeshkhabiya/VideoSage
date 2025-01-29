"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import * as go from "gojs";
import { ReactDiagram } from "gojs-react";
import { useSpaces } from "@/hooks/space-provider";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/auth-provider";
import axios from "axios";

interface MindMapTabProps {
  value: string;
  activeMainTab: string;
}

interface MindMapData {
  nodes: {
    key: number;
    text: string;
    category?: string;
    parent?: number;
  }[];
  links: {
    from: number;
    to: number;
  }[];
}

export default function MindMapTab({
  value,
  activeMainTab,
}: MindMapTabProps) {
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [youtube_id, setYoutubeId] = useState<string>("");
  const [content_id, setContentId] = useState<string>("");
  const { id } = useParams();
  const { spaces } = useSpaces();
  const { user } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
      async function fetchMindMap() {
        try {
          const response = await axios.get(
            `/api/generate/mindmap?video_id=${youtube_id}&content_id=${content_id}`,
            {
              headers: {
                authorization: user?.token
              }
            }
          );
          const data = await response?.data;
          if (data) {
            // @ts-ignore
            setMindMapData(data.data);
          }
        } catch (error) {
          console.error("Error fetching mindmap:", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchMindMap();
    }
  }, [spaces, id, youtube_id, content_id, activeMainTab, value, user?.token]);

  // Initialize the diagram
  function initDiagram() {
    const $ = go.GraphObject.make;
    const diagram = $(go.Diagram, {
      "undoManager.isEnabled": true,
      layout: $(go.TreeLayout, {
        angle: 90,
        layerSpacing: 35,
        alignment: go.TreeLayout.AlignmentStart
      }),
      model: $(go.GraphLinksModel, {
        linkKeyProperty: "key"
      })
    });
 
    // @ts-ignore
    diagram.background = "white";

    // Define node templates for different categories
    const rootTemplate = $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle", { 
        fill: "#2196F3",
        stroke: "black" 
      }),
      $(go.TextBlock, { 
        margin: 8, 
        stroke: "white",
        font: "14px sans-serif"
      },
        new go.Binding("text", "text"))
    );

    const sectionTemplate = $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle", { 
        fill: "#4CAF50",
        stroke: "black"
      }),
      $(go.TextBlock, { 
        margin: 8,
        stroke: "white",
        font: "14px sans-serif"
      },
        new go.Binding("text", "text"))
    );

    const topicTemplate = $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle", { 
        fill: "#FF9800",
        stroke: "black"
      }),
      $(go.TextBlock, { 
        margin: 8,
        stroke: "white",
        font: "14px sans-serif"
      },
        new go.Binding("text", "text"))
    );

    const subtopicTemplate = $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle", { 
        fill: "#9C27B0",
        stroke: "black"
      }),
      $(go.TextBlock, { 
        margin: 8,
        stroke: "white",
        font: "14px sans-serif"
      },
        new go.Binding("text", "text"))
    );

    diagram.nodeTemplateMap.add("root", rootTemplate);
    diagram.nodeTemplateMap.add("section", sectionTemplate);
    diagram.nodeTemplateMap.add("topic", topicTemplate);
    diagram.nodeTemplateMap.add("subtopic", subtopicTemplate);

    diagram.linkTemplate =
      $(go.Link,
        { routing: go.Link.Orthogonal },
        $(go.Shape, { 
          strokeWidth: 1.5,
          stroke: "black"
        })
      );

    return diagram;
  }

  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4" suppressHydrationWarning>
      {activeMainTab === value && (
        <Card className="h-full flex flex-col p-6 min-h-0">
          <div className="relative flex-1 rounded-lg border bg-white dark:bg-white overflow-hidden">
            {mindMapData && (
              <ReactDiagram
                initDiagram={initDiagram}
                divClassName="diagram-component h-full w-full"
                nodeDataArray={mindMapData.nodes}
                linkDataArray={mindMapData.links}
              />
            )}
          </div>
        </Card>
      )}
    </TabsContent>
  );
}
