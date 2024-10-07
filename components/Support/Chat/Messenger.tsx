"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Pusher from "pusher-js";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";
import { Label } from "@/components/ui/label";
import { Send, Users } from "lucide-react";


type Message = {
  id: number;
  senderId: number;
  content: string;
  timestamp: string;
  roomId: number;
};

type Room = {
  id: number;
  name: string;
};

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messageEndRef = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const customerId = session?.user?.id ? Number(session.user.id) : undefined;
 
  useEffect(() => {
    if (customerId) {
      setIsLoading(true);
      fetch(`/api/support/messages?userId=${customerId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data) => {
          setMessages(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
          setIsLoading(false);
        });
    }
  }, [customerId]);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe("chat-channel");
    channel.bind("new-message", (data: Message) => {
      if (data.roomId) {
        setMessages((prevMessages) => [...prevMessages, data]);
      }
    });
    return () => {
      pusher.unsubscribe("chat-channel");
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = async () => {
    if (newMessage.trim() ) {
      await fetch("/api/support/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          senderId: customerId,
          
        }),
      });
      setNewMessage("");
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>Please sign in to access the support chat.</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardTitle className="text-2xl font-bold">Support Chat</CardTitle>
        {session?.user?.company && (
          <p className="text-sm opacity-80">
            {session.user.company} : {session.user.role}
          </p>
        )}
      </CardHeader> 
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] p-4">
          {isLoading ? (
            <div>Loading messages...</div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex mb-4 ${
                  message.senderId === customerId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[70%] ${
                    message.senderId === customerId
                      ? "flex-row-reverse space-x-reverse"
                      : "flex-row"
                  }`}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.senderId}`}
                    />
                  </Avatar>
                  <div
                    className={`flex flex-col ${
                      message.senderId === customerId ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`rounded-lg p-2 ${
                        message.senderId === customerId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messageEndRef}></div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 bg-gray-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}