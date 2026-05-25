"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

const PUBLIC_ROUTES = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, loading } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!token && !isPublic) {
      router.replace("/login");
    } else if (token && isPublic) {
      router.replace("/");
    } else {
      setChecking(false);
    }
  }, [token, loading, pathname, router]);

  if (checking || loading) {
    return (
      <div className="min-h-screen bg-[#f4f3ef] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#E94E1B]" />
      </div>
    );
  }

  return <>{children}</>;
}
