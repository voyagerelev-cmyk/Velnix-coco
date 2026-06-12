"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
    const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signUp = async () => {
    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/");
    } catch (error) {
      console.error("Supabase sign-up error:", error);
      alert(error instanceof Error ? error.message : "Signup failed. Check console.");
    }
  };

  const login = async () => {
    if (!email || !password) {
      alert("Email and password are required.");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      router.push("/");
    } catch (error) {
      console.error("Supabase login error:", error);
      alert(error instanceof Error ? error.message : "Login failed. Check console.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-800 p-8 rounded-2xl w-full max-w-md border border-zinc-700">

        <h1 className="text-4xl font-bold mb-6 text-center">
          Welcome
        </h1>

        <div className="flex flex-col gap-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-zinc-900 p-3 rounded-xl border border-zinc-700 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-900 p-3 rounded-xl border border-zinc-700 outline-none"
          />

          <button
            onClick={signUp}
            className="bg-blue-500 py-3 rounded-xl hover:bg-blue-600"
          >
            Sign Up
          </button>

          <button
            onClick={login}
            className="bg-zinc-700 py-3 rounded-xl hover:bg-zinc-600"
          >
            Login
          </button>

        </div>
      </div>
    </main>
  );
}