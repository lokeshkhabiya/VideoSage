"use client";

import { TabsContent } from "@/components/ui/tabs";
import Chat from "../chat";

interface ChatTabProps {
  value: string;
}

export default function ChatTab({
  value
}: ChatTabProps) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      <Chat />
    </TabsContent>
  );
}
