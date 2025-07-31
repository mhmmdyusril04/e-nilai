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
        <div className="relative z-10 border-b px-4 py-4 bg-gray-50">
            <div className="items-center container mx-auto justify-between flex">
                <Link href="/" className="flex gap-2 items-center text-xl text-black font-bold">
                    <Image src="/logo.png" width="50" height="50" alt="file drive logo" />
                    TEMAN KERJA
                </Link>

                <div className="flex gap-2">
                    {/* <OrganizationSwitcher /> */}
                    <UserButton />
                    <SignedOut>
                        <SignInButton>
                            <Button className="bg-blue-950 text-white">Sign In</Button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>
        </div>
    );
}