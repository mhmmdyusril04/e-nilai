"use client";

import { useAuthRole } from "@/app/hooks/useAuthRole";
import { Loader2 } from "lucide-react";
import { UserInvitationManager } from "../admin/_components/UserInvitationManager";
import { UserManager } from "../admin/_components/UserManager";

export default function UsersPage() {
    const { role, isLoading } = useAuthRole();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        );
    }

    if (role !== 'admin') {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-2xl text-red-600">Anda tidak memiliki hak akses ke halaman ini.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8">
            <h1 className="text-4xl font-bold">Users Manager</h1>

            <section className="grid grid-cols-1 gap-8 items-start">
                <UserInvitationManager />
                <UserManager />
            </section>

        </div>
    );
}