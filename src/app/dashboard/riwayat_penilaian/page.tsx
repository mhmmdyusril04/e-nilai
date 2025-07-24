import { RiwayatPenilaianTable } from "../admin/_components/RiwayatPenilaianTable";

export default function AdminRiwayatPage() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Riwayat Penilaian Pegawai</h1>
      <RiwayatPenilaianTable />
    </main>
  );
}
