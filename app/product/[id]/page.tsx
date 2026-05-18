"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProductPage() {
  const params = useParams();

  const [message, setMessage] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");

  const [product, setProduct] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchComments = async (productId: number) => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      return;
    }

    setComments(data || []);
  };

  const addComment = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    const { error } = await supabase
      .from("comments")
      .insert([
        {
          product_id: product.id,
          user_id: currentUser.id,
          content: commentText,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setCommentText("");

    fetchComments(product.id);
  };

  const sendMessage = async () => {
    if (!currentUser) {
      alert("Please login first");
      return;
    }

    const { error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: currentUser.id,
          receiver_id: product.user_id,
          product_id: product.id,
          message,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Message sent!");

    setMessage("");
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) return;

      const id = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      if (error) {
        return;
      }

      setProduct(data);

      fetchComments(data.id);
    };

    fetchProduct();

    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, [params]);

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white p-4 sm:p-6 lg:p-10">
      <div className="max-w-5xl mx-auto bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-4 sm:p-6 lg:p-8 rounded-3xl">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 sm:h-80 lg:h-[500px] object-cover rounded-3xl mb-8"
        />

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
          {product.name}
        </h1>

        <p className="text-zinc-400 mb-4">
          Seller: {product.seller}
        </p>

        <p className="text-2xl text-blue-400 mb-6">
          {product.price}
        </p>

        <div className="inline-block bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm mb-6 border border-blue-500/30">
          {product.category}
        </div>

        <p className="text-zinc-300">
          {product.description}
        </p>

        {/* Comments */}
        <div className="mt-8 flex flex-col gap-4">
  {comments.map((comment) => (
    <div
      key={comment.id}
      className="bg-zinc-800/70 backdrop-blur-md border border-zinc-700 rounded-3xl p-5 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-zinc-400">
          Community Member
        </p>

        <p className="text-xs text-zinc-500">
          New Comment
        </p>
      </div>

      <p className="text-zinc-200 text-lg leading-relaxed">
        {comment.content}
      </p>
    </div>
  ))}
</div>

        {/* Message Seller */}
        <div className="mt-10 border-t border-zinc-700 pt-6">
          <h2 className="text-2xl font-bold mb-4">
            Message Seller
          </h2>

          <textarea
            placeholder="Write your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4 outline-none focus:border-blue-500 min-h-[140px]"
          />

          <button
            onClick={sendMessage}
            className="mt-4 bg-blue-500 px-6 py-3 rounded-xl hover:bg-blue-600"
          >
            Send Message
          </button>
        </div>

      </div>
    </main>
  );
}