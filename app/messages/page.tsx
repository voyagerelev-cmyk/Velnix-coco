"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user);

    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      return;
    }

    setMessages(data || []);
  };

 useEffect(() => {
  fetchMessages();

  const channel = supabase
    .channel("messages-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
      },
      () => {
        fetchMessages();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white p-4 sm:p-6 lg:p-10">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-10">
        Messages
      </h1>

      <div className="flex flex-col gap-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-zinc-800/80 backdrop-blur-md border border-zinc-700 rounded-3xl p-6 hover:border-blue-500 transition"
          >
            <p className="text-zinc-400 text-sm mb-2">
  From: {msg.sender_id === currentUser?.id ? "You" : "Buyer"}
</p>

            <p className="text-lg">
              {msg.message}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}