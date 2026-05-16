"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function DashboardPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const fetchMyProducts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setCurrentUser(user);

    if (!user) return;

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error.message);
      return;
    }

    setProducts(data || []);
  };

  useEffect(() => {
    fetchMyProducts();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        My Listings
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-52 object-cover rounded-xl mb-4"
            />

            <h2 className="text-2xl font-bold">
              {product.name}
            </h2>

            <p className="text-zinc-400 mt-2">
              {product.price}
            </p>

            <Link href={`/product/${product.id}`}>
              <button className="mt-4 w-full bg-blue-500 py-2 rounded-xl hover:bg-blue-600">
                View Product
              </button>
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}