"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { RedirectToSignIn } from "@clerk/nextjs";
import { useAuthRole } from "@/app/hooks/useAuthRole";
import React from "react";

export default function LandingPage() {
  const { isSignedIn } = useAuth();
  const { role } = useAuthRole();
  const router = useRouter();

  const roleRedirectMap: Record<string, string> = {
    admin: "/dashboard/admin",
    ketua_bidang: "/dashboard/leader",
    atasan: "/dashboard/superior",
  };

  const hasValidRole = role in roleRedirectMap;
  const [showSignIn, setShowSignIn] = React.useState(false);

  const handleMulai = () => {
    if (!isSignedIn) {
      setShowSignIn(true); 
    } else if (hasValidRole) {
      router.push(roleRedirectMap[role]);
    }
  };

  return (
    <>
      {showSignIn && <RedirectToSignIn />}
      <div className="bg-white">
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl py-8">
            <div className="text-center">
              <Image
                src="/logo.png"
                width="150"
                height="150"
                alt="file drive logo"
                className="inline-block mb-8"
              />
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Teman Kerja
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Platform penilaian digital yang memudahkan Pegawai mengurus,
                menilai, memantau Reward atau Punishmen dengan Transfaransi dan
                adil
              </p>

              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isSignedIn && !hasValidRole ? (
                  <span className="text-sm text-gray-500 italic">
                    Role anda belum memiliki akses
                  </span>
                ) : (
                  <button
                    onClick={handleMulai}
                    className="rounded-md bg-blue-950 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Mulai
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
