"use client";

import { Doc } from "@/../../convex/_generated/dataModel";
import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const nominasiSchema = z.object({
    periode: z.string().min(3, "Periode harus diisi"),
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
        defaultValues: { periode: "" },
    });

    async function onSubmit(values: z.infer<typeof nominasiSchema>) {
        if (!selectedPegawai) return;
        try {
            await createNominasi({
                pegawaiId: selectedPegawai._id,
                periode: values.periode,
            });
            toast.success("Sukses", { description: `${selectedPegawai.name} berhasil dinominasikan.` });
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
                        <FormField
                            control={form.control}
                            name="periode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Periode Penilaian</FormLabel>
                                    <FormControl>
                                        <Input placeholder="cth: Kuartal 3 2025" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kirim Nominasi
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}