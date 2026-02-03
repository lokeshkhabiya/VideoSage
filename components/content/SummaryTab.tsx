"use client";

import { TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Markdown from "@/components/markdown";

interface SummaryTabProps {
  value: string;
  activeMainTab: string;
}

export default function SummaryTab({
  value,
  activeMainTab,
}: SummaryTabProps) {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState("");

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      async function fetchData() {
        try {
          const response = await axios.get(`/api/generate/summary?content_id=${id}`);

          if (response?.data) {
            // @ts-expect-error response.data.data type is unknown
            setSummaryData(response?.data?.data);
          }
        } catch (error) {
          console.log("error while getting summary: ", error);
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }
  }, [id]);

  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      {activeMainTab === value && (
        <Card className="h-full flex flex-col min-h-0">
          <ScrollArea className="p-6 flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {summaryData && <Markdown content={summaryData} />}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </TabsContent>
  );
}
