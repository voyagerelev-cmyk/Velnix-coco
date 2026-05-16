"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ProductPage() {
  const params = useParams();
  const [message, setMessage] = useState("");

 const [product, setProduct] = useState<any>(null);
const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params?.id) return;

      const id = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

      console.log("ID:", id);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", Number(id))
        .single();

      console.log(data);
      console.log(error);

      if (error) {
        return;
      }

      setProduct(data);
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

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-4xl mx-auto bg-zinc-900 p-8 rounded-3xl">

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-96 object-cover rounded-2xl mb-8"
        />

        <h1 className="text-5xl font-bold mb-4">
          {product.name}
        </h1>

        <p className="text-zinc-400 mb-4">
          Seller: {product.seller}
        </p>

        <p className="text-2xl text-blue-400 mb-6">
          {product.price}
        </p>

        <p className="text-zinc-300">
          {product.description}
        </p>
<div className="mt-10 border-t border-zinc-700 pt-6">
  <h2 className="text-2xl font-bold mb-4">
    Message Seller
  </h2>

  <textarea
    placeholder="Write your message..."
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 outline-none"
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