"use client";

import { Doc } from "@/../../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const nominasiSchema = z.object({
  kuartal: z.string().min(1, "Pilih kuartal"),
  tahun: z.string().min(4, "Masukkan tahun yang valid"),
});

interface NominationDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedPegawai: Doc<"pegawai"> | null;
}

export function NominationDialog({
  isOpen,
  onOpenChange,
  selectedPegawai,
}: NominationDialogProps) {
  const { toast } = useToast();
  const createNominasi = useMutation(api.nomination.createNomination);

  const form = useForm<z.infer<typeof nominasiSchema>>({
    resolver: zodResolver(nominasiSchema),
    defaultValues: {
      kuartal: "1",
      tahun: new Date().getFullYear().toString(),
    },
  });

  async function onSubmit(values: z.infer<typeof nominasiSchema>) {
    if (!selectedPegawai) return;
    const periode = `Kuartal ${values.kuartal} ${values.tahun}`;
    try {
        
      const currentUserId = undefined as unknown as Doc<"users">["_id"]; // Replace with actual user ID

      await createNominasi({
        pegawaiId: selectedPegawai._id,
        periode,
        createdBy: currentUserId, // Use the correct user ID here
      });
      toast.success("Sukses", {
        description: `${selectedPegawai.name} berhasil dinominasikan.`,
      });
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Error", { description: "Gagal membuat nominasi." });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nominasikan: {selectedPegawai?.name}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="kuartal"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Kuartal</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="border px-3 py-2 rounded w-full"
                      >
                        <option value="1">Kuartal 1</option>
                        <option value="2">Kuartal 2</option>
                        <option value="3">Kuartal 3</option>
                        <option value="4">Kuartal 4</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tahun"
                render={({ field }) => (
                  <FormItem className="w-1/2">
                    <FormLabel>Tahun</FormLabel>
                    <FormControl>
                      <Input type="number" min="2000" max="2100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Batal
                </Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Kirim Nominasi
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
