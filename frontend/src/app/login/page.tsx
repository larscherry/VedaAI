"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [teacherId, setTeacherId] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.login(teacherId, password);
      setAuth(token, user);
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ef] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <div className="flex items-center gap-2 mb-8">
            <img src="/veda.png" alt="VedaAI" className="h-10 w-10 object-contain" />
            <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">VedaAI</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1a1a1a]">Welcome back</h1>
          <p className="text-sm text-[#8a8a90] mt-1 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#1a1a1a]">Teacher ID</label>
              <input
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                placeholder="Enter your employee ID"
                className="mt-1 w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 focus:border-[#E94E1B]"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#1a1a1a]">Password</label>
              <div className="relative mt-1">
                <input
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-11 rounded-xl bg-[#f7f7f8] border border-[#e5e5e7] px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#E94E1B]/30 focus:border-[#E94E1B]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a8a90] cursor-pointer"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-black transition cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#8a8a90]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#E94E1B] font-semibold hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
