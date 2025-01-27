"use client";

import { TabsContent } from "@/components/ui/tabs";
import Chat from "../chat";

interface ChatTabProps {
  value: string;
  activeMainTab: string;
  chatInput: string;
  setChatInput: (value: string) => void;
  handleChatSubmit: (e: React.FormEvent) => void;
  dummyChatMessages: { role: string; content: string }[];
}

export default function ChatTab({
  value,
  activeMainTab,
  chatInput,
  setChatInput,
  handleChatSubmit,
  dummyChatMessages,
}: ChatTabProps) {
  return (
    <TabsContent value={value} className="flex-1 min-h-0 overflow-hidden mt-4">
      <Chat />
    </TabsContent>
  );
}
