"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function RiwayatPenilaian() {
  const data = useQuery(api.evaluation.getMyEvaluations);

  if (data === undefined) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className="text-center text-gray-500">
        Belum ada penilaian yang diselesaikan.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <Card key={item._id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{item.namaPegawai}</CardTitle>
              <Badge>{item.periode}</Badge>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-gray-700">
            <p>
              Unit Kerja: <strong>{item.namaBidang}</strong> 
            </p>
            <p>
              Nilai Akhir: <strong>{item.rataRataNilai}</strong> 
            </p>
            <p>
              Tanggal Dinilai: {new Date(item.tanggal).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
