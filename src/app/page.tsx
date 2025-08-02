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

  // Pemetaan role ke halaman
  const roleRedirectMap: Record<string, string> = {
    admin: "/dashboard/admin",
    ketua_bidang: "/dashboard/leader",
    atasan: "/dashboard/superior",
  };

  const hasValidRole = role in roleRedirectMap;
  const [showSignIn, setShowSignIn] = React.useState(false);

  const handleMulai = () => {
    if (!isSignedIn) {
      setShowSignIn(true); // Tampilkan komponen RedirectToSignIn
    } else if (hasValidRole) {
      router.push(roleRedirectMap[role]); // Arahkan ke halaman sesuai role
    }
    // Jika signed in tapi role tidak valid → tidak melakukan apa-apa
  };

  return (
    <>
      {showSignIn && <RedirectToSignIn />}
      <div className="relative bg-[url('/background.jpg')] bg-cover bg-center bg-no-repeat min-h-screen text-white">
        <div className="absolute inset-0 bg-black/60 z-0" />
        <div className="relative container mx-auto flex flex-col items-center justify-center min-h-screen px-4">
          <div
            className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            aria-hidden="true"
          >
            <div
              className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            />
          </div>
          <div className="mx-auto max-w-2xl py-8">
            <div className="text-center text-white">
              <Image
                src="/LOGO.jpg"
                width="200"
                height="200"
                alt="file drive logo"
                className="inline-block mb-8 rounded-full shadow-lg"
              />

              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl drop-shadow-lg">
                TEMAN KERJA
              </h1>
              <p className="mt-6 text-lg leading-8 drop-shadow-md">
                Sistem Penilaian Kinerja Pegawai
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                {isSignedIn && !hasValidRole ? (
                  <span className="text-sm text-gray-500 italic">
                    Role anda belum memiliki akses
                  </span>
                ) : (
                  <button
                    onClick={handleMulai}
                    className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
