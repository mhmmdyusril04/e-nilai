"use client";

import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type NominasiDetail = {
    _id: Id<"nominasi">;
    namaPegawai?: string;
};

interface PenilaianFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    nominasi: NominasiDetail | null;
}

const formSchema = z.object({
    skor: z.record(z.string(), z.number().min(0).max(100)),
});


export function PenilaianFormDialog({ isOpen, onOpenChange, nominasi }: PenilaianFormDialogProps) {
    const { toast } = useToast();
    const indikatorList = useQuery(api.indikator.getIndikator);
    const submitPenilaian = useMutation(api.evaluation.submitAssessment);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen && indikatorList) {
            const defaultValues: Record<string, number> = {};
            indikatorList.forEach(item => {
                defaultValues[item.name] = 50;
            });
            form.reset({ skor: defaultValues });
        }
    }, [isOpen, indikatorList, form]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!nominasi) return;
        const skorArray = Object.entries(values.skor).map(([indikator, nilai]) => ({
            indikator,
            nilai,
        }));
        try {
            await submitPenilaian({
                nominasiId: nominasi._id,
                skor: skorArray,
            });
            toast.success("Sukses", {
                description: `Penilaian untuk ${nominasi.namaPegawai} berhasil dikirim.`,
            });
            onOpenChange(false);
        } catch {
            toast.error("Error", {
                description: "Gagal mengirim penilaian.",
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Form Penilaian Kinerja: {nominasi?.namaPegawai}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                        {indikatorList?.map((indikator) => (
                            <FormField
                                key={indikator._id}
                                control={form.control}
                                name={`skor.${indikator.name}`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{indikator.name}</FormLabel>
                                        <div className="flex items-center gap-4">
                                            <FormControl className="flex-grow">
                                                <Slider
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    value={[field.value]}
                                                    onValueChange={(value) => field.onChange(value[0])}
                                                />
                                            </FormControl>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    className="w-20 h-10 text-center font-bold text-lg"
                                                    value={field.value}
                                                    onChange={(e) => {
                                                        const value = parseInt(e.target.value, 10);
                                                        field.onChange(isNaN(value) ? 0 : value);
                                                    }}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                        <DialogFooter className="mt-8">
                            <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kirim Penilaian
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}