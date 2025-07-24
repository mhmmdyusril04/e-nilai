"use client";

import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Loader2 } from "lucide-react";

export function RiwayatPenilaianTable() {
  const data = useQuery(api.evaluation.getMyEvaluations); // ← pastikan method ini return semua data jika admin

  if (data === undefined) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-center text-gray-500">Belum ada data penilaian.</p>;
  }

  return (
    <div className="overflow-auto rounded-md border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold">No</th>
            <th className="px-4 py-2 text-left font-semibold">Nama Pegawai</th>
            <th className="px-4 py-2 text-left font-semibold">Unit Kerja</th>
            <th className="px-4 py-2 text-left font-semibold">Periode</th>
            <th className="px-4 py-2 text-left font-semibold">Nilai Akhir</th>
            <th className="px-4 py-2 text-left font-semibold">Tanggal Dinilai</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, idx) => (
            <tr key={item._id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{idx + 1}</td>
              <td className="px-4 py-2">{item.namaPegawai}</td>
              <td className="px-4 py-2">{item.namaBidang}</td>
              <td className="px-4 py-2">{item.periode}</td>
              <td className="px-4 py-2 font-semibold">{item.rataRataNilai}</td>
              <td className="px-4 py-2">
                {new Date(item.tanggal).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
