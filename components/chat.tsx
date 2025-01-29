"use client";
import React, { useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Loader2, Send } from "lucide-react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import MessageBox from "./messageBox";
import { useSearchParams } from "next/navigation";
import { useAuthStore } from "@/hooks/auth-provider";

type Props = {};

const Chat = (props: Props) => {
  const params = useSearchParams();
  const video_id = params.get("video_id")?.split("?")[0] ?? "";
  const content_id = params.get("video_id")?.split("?")[1]?.split("=")[1] ?? "";
  const { user } = useAuthStore();

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "../api/generate/chat",
      headers: {
        Authorization: `${user?.token}`,
      },
    });

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
          {messages.map((message, index) => {
            console.log(message.content);
            return (
              <MessageBox
                key={index}
                role={message.role}
                content={message.content}
              />
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(event, {
              data: {
                content_id: content_id,
                video_id: video_id,
              },
            });
          }}
          className="flex space-x-2"
        >
          <div className="flex-1">
            <Input
              placeholder="Ask anything..."
              value={input}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {/* <span className="sr-only">Send message</span> */}
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default Chat;
