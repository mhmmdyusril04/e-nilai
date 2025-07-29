"use client";

import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Loader2, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const indikatorSchema = z.object({
    name: z.string().min(3, "Nama indikator minimal 3 karakter"),
    description: z.string().optional(),
});

type IndikatorType = Doc<"indikator">;

export function IndikatorManager() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [editingIndikator, setEditingIndikator] = useState<IndikatorType | null>(null);
    const [indikatorToDelete, setIndikatorToDelete] = useState<IndikatorType | null>(null);

    const {
        results: indikatorList,
        status,
        loadMore,
    } = usePaginatedQuery(
        api.indikator.getPaginationIndikator,
        {},
        { initialNumItems: 5 }
    );

    const createIndikator = useMutation(api.indikator.createIndikator);
    const updateIndikator = useMutation(api.indikator.updateIndikator);
    const deleteIndikator = useMutation(api.indikator.deleteIndikator);

    const form = useForm<z.infer<typeof indikatorSchema>>({
        resolver: zodResolver(indikatorSchema),
        defaultValues: { name: "", description: "" },
    });

    function handleEditClick(indikator: IndikatorType) {
        setEditingIndikator(indikator);
        form.setValue("name", indikator.name);
        form.setValue("description", indikator.description ?? "");
        setIsDialogOpen(true);
    }

    function handleAddClick() {
        setEditingIndikator(null);
        form.reset({ name: "", description: "" });
        setIsDialogOpen(true);
    }

    function handleDeleteClick(indikator: IndikatorType) {
        setIndikatorToDelete(indikator);
        setIsConfirmDeleteOpen(true);
    }

    async function onConfirmDelete() {
        if (!indikatorToDelete) return;
        try {
            await deleteIndikator({ indikatorId: indikatorToDelete._id });
            toast.success("Sukses", { description: `Indikator "${indikatorToDelete.name}" berhasil dihapus.` });
        } catch {
            toast.error("Error", { description: "Gagal menghapus indikator." });
        } finally {
            setIsConfirmDeleteOpen(false);
            setIndikatorToDelete(null);
        }
    }

    async function onSubmit(values: z.infer<typeof indikatorSchema>) {
        try {
            if (editingIndikator) {
                await updateIndikator({ indikatorId: editingIndikator._id, ...values });
                toast.success("Sukses", { description: `Indikator "${editingIndikator.name}" berhasil diperbarui.` });
            } else {
                await createIndikator(values);
                toast.success("Sukses", { description: "Indikator baru berhasil ditambahkan." });
            }
            form.reset();
            setIsDialogOpen(false);
            setEditingIndikator(null);
        } catch {
            toast.error("Error", { description: "Operasi gagal." });
        }
    }

    return (
        <>
            <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle></AlertDialogHeader>
                    <AlertDialogDescription>Aksi ini akan menghapus indikator {indikatorToDelete?.name} secara permanen.</AlertDialogDescription>
                    <AlertDialogFooter><AlertDialogCancel>Batal</AlertDialogCancel><AlertDialogAction onClick={onConfirmDelete}>Lanjutkan Hapus</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <CardTitle>Manajemen Indikator</CardTitle>
                        <Button variant="outline" onClick={handleAddClick}>+ Tambah Indikator</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogHeader><DialogTitle>{editingIndikator ? "Edit Indikator" : "Tambah Indikator Baru"}</DialogTitle></DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Nama Indikator</FormLabel><FormControl><Input placeholder="cth: Disiplin Kehadiran" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <DialogFooter className="mt-4">
                                        <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                        <Button type="submit" disabled={form.formState.isSubmitting}>
                                            {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader><TableRow><TableHead>Nama Indikator</TableHead><TableHead className="text-right">Aksi</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {indikatorList?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Belum Ada Indikator.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {indikatorList?.map((indikator) => (
                                    <TableRow key={indikator._id}>
                                        <TableCell className="font-medium">{indikator.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(indikator)}><PencilIcon className="w-4 h-4" /></Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(indikator)}><TrashIcon className="w-4 h-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="flex justify-center mt-4">
                        <Button
                            onClick={() => loadMore(5)}
                            disabled={status !== "CanLoadMore"}
                            variant="ghost"
                            size="sm"
                        >
                            {status === "LoadingMore" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {status === "CanLoadMore" ? "Load More" : "End of List"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}