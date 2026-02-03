"use client";
import React, { useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Loader2, Send } from "lucide-react";
import { Input } from "./ui/input";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import MessageBox from "./messageBox";
import { useParams } from "next/navigation";

const Chat = () => {
  const { id } = useParams();
  const contentId = Array.isArray(id) ? id[0] : id;
  const [input, setInput] = useState("");

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/generate/chat",
      body: contentId ? { content_id: contentId } : {},
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const getMessageText = (message: (typeof messages)[number]) => {
    const parts = message.parts ?? [];
    const textPart = parts.find((p): p is { type: "text"; text: string } => p.type === "text");
    return textPart?.text ?? "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <Card className="h-full flex flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm">
              Welcome to the chat! Ask me anything. I may not always be right,
              but your feedback will help me improve!
            </p>
          </div>
          {messages.map((message) => {
            const text = getMessageText(message);
            if (!text) return null;
            return (
              <MessageBox
                key={message.id}
                role={message.role}
                content={text}
              />
            );
          })}
          {isLoading && (
            <div className="flex items-center space-x-2 p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]"></div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <Button type="submit" size="icon" disabled={isLoading || !contentId}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default Chat;
