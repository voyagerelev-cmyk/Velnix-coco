"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);

  const fetchFavorites = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("favorites")
      .select(`
        id,
        products (
          id,
          name,
          price,
          seller,
          image
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      console.log(error.message);
      return;
    }

    setFavorites(data || []);
  };
  const removeFavorite = async (favoriteId: number) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("id", favoriteId);

  if (error) {
    alert(error.message);
    return;
  }

  fetchFavorites();
};

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-bold mb-10">
        Favorites
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((fav) => {
          const product = fav.products;

          return (
            <div
              key={fav.id}
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
                Seller: {product.seller}
              </p>

              <p className="text-blue-400 mt-2">
                {product.price}
              </p>

              <Link href={`/product/${product.id}`}>
                <button className="mt-4 w-full bg-blue-500 py-2 rounded-xl hover:bg-blue-600">
                  View Product
                </button>
              </Link>
              <button
  onClick={() => removeFavorite(fav.id)}
  className="mt-2 w-full bg-red-500 py-2 rounded-xl hover:bg-red-600"
>
  Remove Favorite
</button>
            </div>
          );
        })}
      </div>
    </main>
  );
}