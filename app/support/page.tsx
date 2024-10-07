"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FormReport from "@/components/Support/Report/FormReport";
import Messenger from "@/components/Support/Chat/Messenger";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessengerAdmin from "@/components/Support/Chat/MessengerAdmin";
import { useRouter } from "next/navigation";
import Report_table from "@/components/Support/Report/Report_table";

interface Customer {
  id: number;
  name: string;
  email: string;
  company: string;
}

interface Room {
  id: number;
  customer: Customer;
  unreadMessagesCount: number;
}

const Support = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasRoom, setHasRoom] = useState(false);
  const { data: session, status } = useSession();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const router = useRouter();

  const checkCustomerRoom = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/support/room?customerId=${session?.user?.id}`
      );
      const data = await res.json();
      if (data.room) {
        setHasRoom(true);
        setSelectedRoom(data.room);
      }
    } catch (error) {
      console.error("Failed to fetch room data", error);
    }
  }, [session?.user?.id]);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch(`/api/support/admin`);
      const data = await res.json();
      console.log(data);
      setRooms(data);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
    }
  }, []);

  useEffect(() => {
    if (session) {
      if (status === "authenticated" && session?.user?.role === "admin") {
        setIsAdmin(true);
        fetchRooms();
        console.log(session);
      } else if (
        status === "authenticated" &&
        session?.user?.role !== "admin"
      ) {
        setIsAdmin(false);
        checkCustomerRoom();
        console.log(session);
      } else {
        router.push("/login");
        console.log(session);
      }
    }
  }, [session, status, checkCustomerRoom, router, fetchRooms]);

  const createRoom = async () => {
    try {
      const res = await fetch("/api/support/room", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ customerId: session?.user?.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setHasRoom(true);
        setSelectedRoom(data.room);
      }
    } catch (error) {
      console.error("Failed to create room", error);
    }
  };

  const handleTabChange = (value: string) => {
    if (value === "chat" && isAdmin) {
      fetchRooms();
    }
  };

  const handleRoomSelection = async (room: Room) => {
    setSelectedRoom(room);
    
    // Mark messages as read
    try {
      const response = await fetch('/api/support/messages/isRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: room.id,
          userId: session?.user?.id ? parseInt(session.user.id, 10) : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message read status');
      }

      // Update local state to reflect read messages
      setRooms(prevRooms => 
        prevRooms.map(r => 
          r.id === room.id ? { ...r, unreadMessagesCount: 0 } : r
        )
      );
    } catch (error) {
      console.error('Error updating message read status:', error);
    }
  };

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle>Support</CardTitle>
        <CardDescription>
          Make changes to your account here. Click save when you're done.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="report"
          className="w-full"
          onValueChange={handleTabChange}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="report">Report</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
          </TabsList>
          {isAdmin ? (
            <TabsContent className="w-full mx-auto" value="report">
              <Report_table />
            </TabsContent>
          ) : (
            <TabsContent className="w-full mx-auto" value="report">
              <FormReport />
            </TabsContent>
          )}

          <TabsContent
            className={`grid ${isAdmin ? "grid-cols-2" : "grid-cols-1"}`}
            value="chat"
          >
            {isAdmin ? (
              <>
                <div className="bg-white border-r border-gray-200 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <Input
                      type="text"
                      placeholder="Search..."
                      className="w-full mr-2"
                    />
                    <Button variant="ghost" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="overflow-y-auto h-full">
                    {rooms.map((room: Room) => (
                      <div
                        key={room.id}
                        className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer ${
                          selectedRoom?.id === room.id ? "bg-gray-100" : ""
                        }`}
                        onClick={() => handleRoomSelection(room)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={`/placeholder.svg?height=48&width=48`}
                            alt={room.customer.company || "Avatar"}
                          />
                          <AvatarFallback>
                            {room.customer.name
                              ? room.customer.name
                                  .split(" ")
                                  .map((word) => word[0])
                                  .join("")
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 flex-grow">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">
                              {room.customer.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {room.customer.company}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {room.customer.email}
                          </p>
                        </div>
                        {room.customer.name && room.unreadMessagesCount > 0 && (
                          <div className="w-2 h-2 bg-red-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <MessengerAdmin selectedRoom={selectedRoom} />
              </>
            ) : hasRoom ? (
              <Messenger />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <p className="mb-4 text-center">
                  You dont have a support room yet.
                </p>
                <Button onClick={createRoom}>Create Support Chat</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default Support;
