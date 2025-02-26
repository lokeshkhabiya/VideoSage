"use client";
import React, { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Loader2, Send } from "lucide-react";
import { Input } from "./ui/input";
import { useChat } from "ai/react";
import MessageBox from "./messageBox";
import { useAuthStore } from "@/hooks/auth-provider";
import { useSpaces } from "@/hooks/space-provider";
import { useParams } from "next/navigation";

type Props = {};

const Chat = (props: Props) => {
  const { id } = useParams();
  const { spaces } = useSpaces();
  const [youtube_id, setYoutubeId] = useState<string>("");
  const { user } = useAuthStore();

  useEffect(() => {
    for (const space of spaces) {
      const content = space.contents?.find(content => content.id === id);
      if (content) {
        setYoutubeId(content.youtube_id);
        break;
      }
    }
  }, [spaces, id]);

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
            return (
              <MessageBox
                key={index}
                role={message.role}
                content={message.content}
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
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(event, {
              data: {
                video_id: youtube_id,
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
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default Chat;
