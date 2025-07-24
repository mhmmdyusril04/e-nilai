"use client";

import { useAuthRole } from "@/app/hooks/useAuthRole";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { BidangManager } from "./_components/BidangManager";
import { HasilPenilaianChart } from "./_components/HasilPenilaianChart";
import { IndikatorManager } from "./_components/IndikatorManager";
import { PegawaiManager } from "./_components/PegawaiManager";

export default function AdminPage() {
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
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>

            <Button><Link href={"/dashboard/users"}>Manage Users</Link></Button>

            <section>
                <HasilPenilaianChart />
            </section>

            <hr />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <PegawaiManager />
                </div>
                <div className="space-y-8">
                    <BidangManager />
                    <IndikatorManager />
                </div>
            </section>
        </div>
    );
}