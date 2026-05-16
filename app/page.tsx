"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [search, setSearch] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [seller, setSeller] = useState("");
  const [description, setDescription] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [image, setImage] = useState<any>(null);
  const [editingId, setEditingId] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data);
    }

    if (error) {
      console.log(error.message);
    }
  };

 const addProduct = async () => {
  if (editingId) {
    const { error } = await supabase
      .from("products")
      .update({
        name,
        price,
        seller,
        description,
      })
      .eq("id", editingId);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId(null);

    fetchProducts();

    setName("");
    setPrice("");
    setSeller("");
    setDescription("");

    return;
  }

  if (!image) {
    alert("Please select an image");
    return;
  }

  const fileName = `${Date.now()}-${image.name}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(fileName, image);

  if (uploadError) {
    alert(uploadError.message);
    return;
  }

  const imageUrl = supabase.storage
    .from("products")
    .getPublicUrl(fileName).data.publicUrl;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("products")
    .insert([
      {
        name,
        price,
        seller,
        description,
        image: imageUrl,
        user_id: user?.id,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  fetchProducts();

  setName("");
  setPrice("");
  setSeller("");
  setDescription("");
  setImage(null);
};
  useEffect(() => {
    fetchProducts();

    supabase.auth.getUser().then(({ data }) => {
      setCurrentUser(data.user);
    });
  }, []);

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email!");
    }
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Logged in!");
    }
  };
  const logout = async () => {
  await supabase.auth.signOut();

  setCurrentUser(null);

  alert("Logged out!");
};

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-6 border-b border-zinc-800">
        <h1 className="text-3xl font-bold">
          Voyager Market
        </h1>

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 w-64"
        />

        <div className="flex gap-3 items-center">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-800 px-3 py-2 rounded-xl outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-800 px-3 py-2 rounded-xl outline-none"
          />

          <button
            onClick={login}
            className="bg-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-600"
          >
            Login
          </button>

          <button
            onClick={signUp}
            className="bg-blue-500 px-4 py-2 rounded-xl hover:bg-blue-600"
          >
            Sign Up
          </button>
        </div>

       <div className="flex items-center gap-3">
  <p className="text-zinc-400">
    {currentUser?.email}
  </p>

  {currentUser && (
    <button
      onClick={logout}
      className="bg-red-500 px-4 py-2 rounded-xl hover:bg-red-600"
    >
      Logout
    </button>
  )}
</div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-6">
        <h2 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Buy, Sell & Connect
        </h2>

        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          A community marketplace where people can sell products
          and talk with each other.
        </p>
      </section>

      {/* Upload Product */}
      <section className="px-10 mb-16">
        <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-8 max-w-2xl mx-auto">
          <h3 className="text-3xl font-bold mb-6">
            Upload Product
          </h3>

          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-700"
            />

            <input
              type="text"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-700"
            />

            <input
              type="text"
              placeholder="Seller Name"
              value={seller}
              onChange={(e) => setSeller(e.target.value)}
              className="bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-700"
            />

            <input
              type="file"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              className="bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-700"
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-700"
            />

            <button
              onClick={addProduct}
              className="bg-blue-500 py-3 rounded-xl hover:bg-blue-600"
            >
              Add Product
            </button>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="px-10 pb-20">
        <h3 className="text-3xl font-semibold mb-8">
          Trending Products
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {products
            .filter((product) =>
              product.name
                .toLowerCase()
                .includes(search.toLowerCase())
            )
            .map((product) => (
              <div
                key={product.id}
                className="bg-zinc-800/80 backdrop-blur-md p-6 rounded-2xl border border-zinc-700 hover:scale-105 hover:border-blue-500 transition duration-300 shadow-lg hover:shadow-blue-500/20"
              >
                <img
                  src={
                    product.image ||
                    "https://via.placeholder.com/300"
                  }
                  alt={product.name}
                  className="h-40 w-full object-cover rounded-xl mb-4"
                />

                <h4 className="text-xl font-semibold">
                  {product.name}
                </h4>

                <p className="text-zinc-400 text-sm mt-1">
                  Seller: {product.seller}
                </p>

                <p className="text-zinc-500 mt-2 text-sm">
                  {product.description}
                </p>

                <p className="text-zinc-400 mt-2">
                  {product.price}
                </p>

                <Link href={`/product/${product.id}`}>
                  <button className="mt-4 w-full bg-blue-500 py-2 rounded-xl hover:bg-blue-600">
                    View Product
                  </button>
                 <button
  onClick={() => {
    setEditingId(product.id);

    setName(product.name);
    setPrice(product.price);
    setSeller(product.seller);
    setDescription(product.description);
  }}
  className="mt-2 w-full bg-yellow-500 py-2 rounded-xl hover:bg-yellow-600"
>
  Edit
</button>
                </Link>

                {currentUser &&
                  currentUser.id === product.user_id && (
                    <button
                      onClick={async () => {
                        const { error } = await supabase
                          .from("products")
                          .delete()
                          .eq("id", product.id);

                        if (error) {
                          alert(error.message);
                          return;
                        }

                        fetchProducts();
                      }}
                      className="mt-2 w-full bg-red-500 py-2 rounded-xl hover:bg-red-600"
                    >
                      Delete
                    </button>
                  )}
              </div>
            ))}
        </div>
      </section>
    </main>
  );
}