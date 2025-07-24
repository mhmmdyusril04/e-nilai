"use client";

import { api } from "@/../convex/_generated/api";
import { Doc } from "@/../convex/_generated/dataModel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const bidangSchema = z.object({
    name: z.string().min(2, "Nama unit kerja minimal 2 karakter"),
});

type BidangType = Doc<"bidang">;

export function BidangManager() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [editingBidang, setEditingBidang] = useState<BidangType | null>(null);
    const [bidangToDelete, setBidangToDelete] = useState<BidangType | null>(null);

    const {
        results: bidangList,
        status,
        loadMore,
    } = usePaginatedQuery(
        api.bidang.getPaginationBidang,
        {},
        { initialNumItems: 5 }
    );

    const createBidang = useMutation(api.bidang.createBidang);
    const updateBidang = useMutation(api.bidang.updateBidang);
    const deleteBidang = useMutation(api.bidang.deleteBidang);

    const form = useForm<z.infer<typeof bidangSchema>>({
        resolver: zodResolver(bidangSchema),
        defaultValues: { name: "" },
    });

    function handleEditClick(bidang: BidangType) {
        setEditingBidang(bidang);
        form.setValue("name", bidang.name);
        setIsDialogOpen(true);
    }

    function handleAddClick() {
        setEditingBidang(null);
        form.reset({ name: "" });
        setIsDialogOpen(true);
    }

    function handleDeleteClick(bidang: BidangType) {
        setBidangToDelete(bidang);
        setIsConfirmDeleteOpen(true);
    }

    async function onConfirmDelete() {
        if (!bidangToDelete) return;
        try {
            await deleteBidang({ bidangId: bidangToDelete._id });
            toast.success("Sukses", { description: `Bidang "${bidangToDelete.name}" berhasil dihapus.` });
        } catch (error: unknown) {
            let errorMessage = "Gagal menghapus bidang.";
            if (
                typeof error === "object" &&
                error !== null &&
                "data" in error &&
                typeof (error as { data: unknown }).data === "string"
            ) {
                errorMessage = (error as { data: string }).data
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error("Error", { description: errorMessage });
        } finally {
            setIsConfirmDeleteOpen(false);
            setBidangToDelete(null);
        }
    }

    async function onSubmit(values: z.infer<typeof bidangSchema>) {
        try {
            if (editingBidang) {
                await updateBidang({ bidangId: editingBidang._id, name: values.name });
                toast.success("Sukses", { description: `Nama bidang "${editingBidang.name}" berhasil diperbarui.` });
            } else {
                await createBidang({ name: values.name });
                toast.success("Sukses", { description: `Bidang "${values.name}" berhasil ditambahkan.` });
            }
            form.reset({ name: "" });
            setIsDialogOpen(false);
            setEditingBidang(null);
        } catch {
            toast.error("Error", { description: "Operasi gagal." });
        }
    }

    return (
        <>
            <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Aksi ini akan menghapus bidang {bidangToDelete?.name}. Aksi ini tidak dapat dibatalkan jika tidak ada pegawai di dalamnya.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDelete}>Lanjutkan Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <CardTitle>Manajemen Unit Kerja</CardTitle>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" onClick={handleAddClick}>+ Tambah Unit Kerja</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingBidang ? "Edit Unit Kerja" : "Tambah Unit Kerja"}</DialogTitle>
                                </DialogHeader>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Unit Kerja</FormLabel>
                                                <FormControl><Input placeholder="cth: Keuangan" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <DialogFooter className="mt-4">
                                            <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Simpan
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Unit Kerja</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bidangList?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Belum Ada Unit Kerja.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {bidangList?.map((bidang) => (
                                    <TableRow key={bidang._id}>
                                        <TableCell>{bidang.name}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(bidang)}>
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(bidang)}>
                                                <TrashIcon className="w-4 h-4" />
                                            </Button>
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
            </Card >
        </>
    );
}