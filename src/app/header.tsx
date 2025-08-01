import { Button } from "@/components/ui/button";
import {
    SignInButton,
    SignedOut,
    UserButton
} from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

export function Header() {
  return (
    <div className="bg-blue-900 relative min-h-[60px] text-white">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex gap-2 items-center text-xl text-white font-bold w-sm">
          <Image src="/logo.png" width="50" height="50" alt="file drive logo" className="rounded-full"/>
          Sistem Penilaian Kinerja Pegawai
        </Link>

        <div className="flex gap-2 items-center">
          <UserButton />
          <SignedOut>
            <SignInButton>
              <Button
                variant="secondary"
                className="bg-white text-black hover:bg-black hover:text-white transition-colors font-bold"
              >
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </div>
  );
}