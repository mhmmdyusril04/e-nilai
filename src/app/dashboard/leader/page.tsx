"use client";

import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { NominationDialog } from "./_components/NominationDialog";
import { PegawaiCard } from "./_components/PegawaiCard";

export default function KetuaBidangPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedPegawai, setSelectedPegawai] = useState<Doc<"pegawai"> | null>(null);

    const me = useQuery(api.users.getMe);
    const pegawaiList = useQuery(api.workers.getMyWorker);
    const myNominations = useQuery(api.nomination.getMyNominations);

    const nominatedPegawaiIds = useMemo(() => {
        return new Set(myNominations?.map(n => n.pegawaiId));
    }, [myNominations]);

    const hasReachedNominationLimit = nominatedPegawaiIds.size >= 2;
    const isLoading = me === undefined || pegawaiList === undefined || myNominations === undefined;

    function handleNominateClick(pegawai: Doc<"pegawai">) {
        setSelectedPegawai(pegawai);
        setIsDialogOpen(true);
    }

    if (isLoading) {
        return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-12 w-12 animate-spin" /></div>;
    }

    return (
        <>
            <NominationDialog
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                selectedPegawai={selectedPegawai}
            />

            <div className="container mx-auto p-4 md:p-8 space-y-8">
                <h1 className="text-4xl font-bold">
                    {me?.role === 'admin' ? "Tinjauan Pegawai (Admin)" : "Dasbor Kepala Bagian"}
                </h1>
                <p className="text-muted-foreground">
                    {me?.role === 'admin'
                        ? "Anda melihat semua pegawai. Mode nominasi dinonaktifkan untuk admin."
                        : "Pilih hingga 2 pegawai dari unit kerja Anda untuk dinominasikan."
                    }
                </p>

                {hasReachedNominationLimit && me?.role === 'ketua_bidang' && (
                    <div className="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                        <p className="font-bold">Batas Nominasi Tercapai</p>
                        <p>Anda sudah menominasikan 2 pegawai. Anda tidak dapat menominasikan lagi.</p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pegawaiList?.map((pegawai) => {
                        const isNominated = nominatedPegawaiIds.has(pegawai._id);
                        const isButtonDisabled =
                            me?.role === 'admin' ||
                            isNominated ||
                            hasReachedNominationLimit;

                        return (
                            <PegawaiCard
                                key={pegawai._id}
                                pegawai={pegawai}
                                isNominated={isNominated}
                                isButtonDisabled={isButtonDisabled}
                                onNominate={handleNominateClick}
                            />
                        );
                    })}
                </div>
            </div>
        </>
    );
}