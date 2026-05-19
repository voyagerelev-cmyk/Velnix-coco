"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function UserPage() {
  const params = useParams();

  const [products, setProducts] = useState<any[]>([]);
  const [sellerName, setSellerName] = useState("");

  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!params?.userId) return;

      const userId = Array.isArray(params.userId)
        ? params.userId[0]
        : params.userId;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.log(error.message);
        return;
      }

      setProducts(data || []);

      if (data && data.length > 0) {
        setSellerName(data[0].seller);
      }
    };

    fetchUserProducts();
  }, [params]);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">

        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">
            {sellerName}
          </h1>

          <p className="text-zinc-400">
            Seller Profile
          </p>

          <p className="text-blue-400 mt-2">
            {products.length} Products Listed
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-56 object-cover rounded-2xl mb-4"
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

      </div>
    </main>
  );
}