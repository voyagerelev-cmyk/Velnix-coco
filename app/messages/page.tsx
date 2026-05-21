"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchMessages = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user);

    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        product:product_id (
          name
        )
      `)
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      return;
    }

    setMessages(data || []);
  };

  const sendReply = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    const { error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: currentUser.id,
          receiver_id: selectedChat.sender_id,
          product_id: selectedChat.product_id,
          message: newMessage,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNewMessage("");

    fetchMessages();
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
    <main className="h-screen bg-[#0f1115] text-white flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-[320px] bg-[#0b0d11] border-r border-zinc-800 flex flex-col">

        <div className="p-5 border-b border-zinc-800">
          <h1 className="text-2xl font-semibold tracking-tight">
            Messages
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {messages.map((msg) => (
            <button
              key={msg.id}
              onClick={() => setSelectedChat(msg)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition mb-2 ${
                selectedChat?.id === msg.id
                  ? "bg-zinc-800"
                  : "hover:bg-zinc-800"
              }`}
            >

              <div className="w-11 h-11 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold">
                B
              </div>

              <div className="flex-1 text-left">
                <p className="font-medium">
                  {msg.product?.name || "Product"}
                </p>

                <p className="text-sm text-zinc-400 truncate">
                  {msg.message}
                </p>
              </div>

            </button>
          ))}
        </div>

      </aside>

      {/* Chat Area */}
      <section className="flex-1 flex flex-col">

        {/* Top Bar */}
        <div className="h-[72px] border-b border-zinc-800 flex items-center px-6 bg-[#111318]">

          <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold">
            B
          </div>

          <div className="ml-4">
            <h2 className="font-semibold">
              {selectedChat?.product?.name || "Select a chat"}
            </h2>

            <p className="text-sm text-zinc-400">
              Marketplace Chat
            </p>
          </div>

        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

          {messages
            .filter(
              (msg) =>
                !selectedChat ||
                msg.product_id === selectedChat.product_id
            )
            .map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender_id === currentUser?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[420px] px-4 py-3 rounded-2xl text-sm ${
                    msg.sender_id === currentUser?.id
                      ? "bg-blue-600"
                      : "bg-zinc-800"
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            ))}

        </div>

        {/* Bottom Input */}
        <div className="p-5 border-t border-zinc-800 bg-[#111318]">

          <div className="flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 py-3 border border-zinc-800">

            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-zinc-500"
            />

            <button
              onClick={sendReply}
              className="text-sm px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
            >
              Send
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}