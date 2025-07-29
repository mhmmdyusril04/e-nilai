"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { HasilPenilaianChart } from "../admin/_components/HasilPenilaianChart";
import { RiwayatPenilaian } from "../admin/_components/RiwayatPenilaian";
import { PenilaianFormDialog } from "./_components/PenilaianFormDialog";

type NominasiDetail = {
  _id: Id<"nominasi">;
  namaPegawai?: string;
};

export default function AtasanPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedNominasi, setSelectedNominasi] =
    useState<NominasiDetail | null>(null);

  const me = useQuery(api.users.getMe);
  const nominasiList = useQuery(api.nomination.getNominationToBeAssessed);

  function handleStartAssessment(nominasi: NominasiDetail) {
    setSelectedNominasi(nominasi);
    setIsDialogOpen(true);
  }

  const isLoading = me === undefined || nominasiList === undefined;

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  const pageTitle =
    me?.role === "admin" ? "Pantau Nominasi (Admin)" : "Dasbor Atasan";

  return (
    <>
      <PenilaianFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        nominasi={selectedNominasi}
      />

      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <h1 className="text-3xl md:text-4xl font-bold">{pageTitle}</h1>

        <Tabs defaultValue="penilaian">
          <TabsList>
            <TabsTrigger value="penilaian">Perlu Dinilai</TabsTrigger>
            <TabsTrigger value="hasil">Hasil & Diagram</TabsTrigger>
            <TabsTrigger value="riwayat">Riwayat Penilaian</TabsTrigger>
          </TabsList>

          <TabsContent value="penilaian" className="mt-4">
            <div className="space-y-4">
              {nominasiList?.map((item) => (
                <Card key={item._id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                      <CardTitle>{item.namaPegawai}</CardTitle>
                      <Badge>{item.periode}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      {me?.role === "admin" && (
                      <p className="text-sm text-gray-600">
                        Unit kerja: {item.namaBidang}
                      </p>
                      )}
                      <p className="text-sm text-gray-600">
                        NIP: {item.nipPegawai}
                      </p>
                      {me?.role === "admin" && (
                        <p className="text-xs text-blue-600 mt-1">
                          Ditugaskan kepada: <strong>{item.namaPenilai}</strong>
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => handleStartAssessment(item)}
                      disabled={me?.role === "admin"}
                      className="w-full sm:w-auto"
                    >
                      {me?.role === "admin" ? "Pantau" : "Mulai Penilaian"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
              {nominasiList?.length === 0 && (
                <p className="text-center py-12 text-gray-500">
                  Tidak ada nominasi yang perlu diproses saat ini.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="hasil" className="mt-4">
            <HasilPenilaianChart />
          </TabsContent>

          <TabsContent value="riwayat" className="mt-4">
            <RiwayatPenilaian />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
