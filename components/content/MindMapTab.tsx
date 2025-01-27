"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

interface MindMapTabProps {
  value: string;
  activeMainTab: string;
  dummyMindMap: {
    title: string;
    subtopics: string[];
  }[];
}

export default function MindMapTab({
  value,
  activeMainTab,
  dummyMindMap,
}: MindMapTabProps) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col p-6 min-h-0">
          <div className="relative flex-1 rounded-lg border bg-white dark:bg-gray-900 overflow-hidden">
            <svg
              className="h-full w-full"
              viewBox="0 0 800 600"
              style={{
                fontFamily: "system-ui, sans-serif",
                fontSize: "14px",
              }}
            >
              {/* Central Node */}
              <g transform="translate(400,300)">
                <circle r="60" fill="hsl(var(--primary))" />
                <text
                  textAnchor="middle"
                  fill="hsl(var(--primary-foreground))"
                  dy=".3em"
                >
                  MongoDB
                </text>

                {/* Branches */}
                {dummyMindMap.map((branch, index) => {
                  const angle = (index * 2 * Math.PI) / dummyMindMap.length;
                  const x = Math.cos(angle) * 150;
                  const y = Math.sin(angle) * 150;

                  return (
                    <g key={index}>
                      <line
                        x1="0"
                        y1="0"
                        x2={x}
                        y2={y}
                        stroke="hsl(var(--border))"
                        strokeWidth="2"
                      />
                      <circle cx={x} cy={y} r="40" fill="hsl(var(--muted))" />
                      <text
                        x={x}
                        y={y}
                        textAnchor="middle"
                        fill="currentColor"
                        dy=".3em"
                      >
                        {branch.title}
                      </text>

                      {/* Sub-branches */}
                      {branch.subtopics.map((subtopic, sIndex) => {
                        const subAngle = angle + ((sIndex - 1) * Math.PI) / 6;
                        const subX = x + Math.cos(subAngle) * 100;
                        const subY = y + Math.sin(subAngle) * 100;

                        return (
                          <g key={`${index}-${sIndex}`}>
                            <line
                              x1={x}
                              y1={y}
                              x2={subX}
                              y2={subY}
                              stroke="hsl(var(--border))"
                              strokeWidth="1"
                            />
                            <circle
                              cx={subX}
                              cy={subY}
                              r="30"
                              fill="hsl(var(--accent))"
                            />
                            <text
                              x={subX}
                              y={subY}
                              textAnchor="middle"
                              fill="currentColor"
                              dy=".3em"
                              fontSize="12"
                            >
                              {subtopic}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>
        </Card>
      )}
    </TabsContent>
  );
}
