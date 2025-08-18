"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useUserAtom } from "@/store/atoms";

export default function Home() {
  const router = useRouter();
  const {currentUser} = useUserAtom()

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login");
    } else {
      router.replace("/dashboard");
    }
  }, [currentUser, router]);

  return(    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-neutral-900 to-slate-900 text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"></div>
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    </div>)
}
