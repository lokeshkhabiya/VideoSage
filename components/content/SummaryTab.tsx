"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryTabProps {
  value: string;
  activeMainTab: string;
  dummySummary: string[];
  dummyTakeaways: string[];
}

export default function SummaryTab({
  value,
  activeMainTab,
  dummySummary,
  dummyTakeaways,
}: SummaryTabProps) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col min-h-0">
          <ScrollArea className="p-6 flex-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Overview</h2>
                {dummySummary.map((paragraph, index) => (
                  <p
                    key={index}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Key Takeaways</h2>
                <ul className="list-disc space-y-2 pl-4">
                  {dummyTakeaways.map((takeaway, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ScrollArea>
        </Card>
      )}
    </TabsContent>
  );
}
