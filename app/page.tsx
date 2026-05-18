"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [seller, setSeller] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");

  const [currentUser, setCurrentUser] = useState<any>(null);

  const [image, setImage] = useState<any>(null);
  const [editingId, setEditingId] = useState<any>(null);

  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
     .select(`
  *,
  favorites(*)
`)
      .order("created_at", { ascending: false });

    if (data) {
      setProducts(data);
    }

    if (error) {
      console.log(error.message);
    }
  };
  
const addToFavorites = async (productId: number) => {
  if (!currentUser) {
    alert("Please login first");
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .insert([
      {
        user_id: currentUser.id,
        product_id: productId,
      },
    ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Added to favorites!");
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

    };
 

 

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
        category,
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
const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Gaming",
  "Books",
];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-zinc-950 text-white p-4 sm:p-6 lg:p-10">
      {/* Navbar */}
     <nav className="p-6 border-b border-zinc-800 space-y-4">

  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold">
      Qolox
    </h1>

{!currentUser && (
    <div className="flex flex-col sm:flex-row gap-3 items-center w-full lg:w-auto">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-zinc-800 px-3 py-2 rounded-xl outline-none w-full sm:w-auto"
      />
      

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="bg-zinc-800 px-3 py-2 rounded-xl outline-none w-full sm:w-auto"
      />

      <button
        onClick={login}
        className="bg-zinc-700 px-4 py-2 rounded-xl hover:bg-zinc-600 w-full sm:w-auto"
      >
        Login
      </button>

      <button
        onClick={signUp}
        className="bg-blue-500 px-4 py-2 rounded-xl hover:bg-blue-600 w-full sm:w-auto"
      >
        Sign Up
      </button>
    </div>
)}

    <div className="flex items-center gap-3">
      <p className="text-zinc-400 break-all">
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

  </div>

  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="bg-zinc-800/80 border border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500 w-full"
  />

</nav>

      {/* Hero */}
      <section className="text-center py-20 px-6">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Buy, Sell & Connect
        </h2>

        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          A community marketplace where people can sell products
          and talk with each other.
        </p>
      </section>

      {/* Upload Product */}
      <section className="px-4 sm:px-6 lg:px-10 mb-16">
        {currentUser ? (
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
            <select
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  className="bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-700"
>
  <option value="">Select Category</option>
  <option value="Electronics">Electronics</option>
  <option value="Fashion">Fashion</option>
  <option value="Gaming">Gaming</option>
  <option value="Books">Books</option>
</select>

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
        ) : (
  <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-8 max-w-2xl mx-auto text-center">
    <h3 className="text-3xl font-bold mb-4">
      Login Required
    </h3>

    <p className="text-zinc-400">
      Please login to upload products.
    </p>
  </div>
)}
      </section>

      {/* Products */}
      <section className="px-4 sm:px-6 lg:px-10 pb-20">
        <h3 className="text-3xl font-semibold mb-8">
          Trending Products
        </h3>
        <div className="flex flex-wrap gap-3 mb-8">
  {categories.map((cat) => (
    <button
      key={cat}
      onClick={() => setSelectedCategory(cat)}
      className={`px-4 py-2 rounded-xl border transition ${
        selectedCategory === cat
          ? "bg-blue-500 border-blue-500"
          : "bg-zinc-800 border-zinc-700 hover:border-blue-500"
      }`}
    >
      {cat}
    </button>
  ))}
</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((product) => {
  const matchesSearch = product.name
    .toLowerCase()
    .includes(search.toLowerCase());

  const matchesCategory =
    selectedCategory === "All" ||
    product.category === selectedCategory;

  return matchesSearch && matchesCategory;
})
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
                 className="w-full h-56 object-cover rounded-2xl mb-4"
                 />

                <h4 className="text-xl font-semibold">
                  {product.name}
                </h4>

              <div className="text-zinc-400 text-sm mt-1">
  <p>Seller: {product.seller}</p>

  <p className="text-blue-400 text-sm mt-1">
    {product.category}
  </p>
</div>

                <p className="text-zinc-500 mt-2 text-sm">
                  {product.description}
                </p>

      
                <p className="text-zinc-400 mt-2">
                  {product.price}
                </p>
                <p className="text-zinc-400 mt-2">
  {product.price}
</p>

<div className="mt-3 flex items-center gap-2 text-pink-400">
  <span className="animate-pulse text-lg">
    ♥
  </span>

  <p className="text-sm font-medium">
   {product.favorites?.[0]?.count || 0} saved
  </p>
</div>

              <Link href={`/product/${product.id}`}>
  <button className="mt-4 w-full bg-blue-500 py-2 rounded-xl hover:bg-blue-600">
    View Product
  </button>
</Link>

<button
  onClick={() => addToFavorites(product.id)}
  className="mt-2 w-full bg-pink-500 py-2 rounded-xl hover:bg-pink-600"
>
  Add to Favorites
</button>

{currentUser &&
  currentUser.id === product.user_id && (
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
)}

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