"use client";

import { Doc } from "@/../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PegawaiCardProps {
  pegawai: Doc<"pegawai">;
  isNominated: boolean;
  isButtonDisabled: boolean;
  onNominate: (pegawai: Doc<"pegawai">) => void;
}

export function PegawaiCard({
  pegawai,
  isNominated,
  isButtonDisabled,
  onNominate,
}: PegawaiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{pegawai.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">NIP: {pegawai.nip}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onNominate(pegawai)}
          disabled={isButtonDisabled}
        >
          {isNominated ? "Sudah Dinominasikan" : "Nominasikan"}
        </Button>
      </CardFooter>
    </Card>
  );
}
