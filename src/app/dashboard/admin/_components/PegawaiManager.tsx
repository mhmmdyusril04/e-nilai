"use client";

import { api } from "@/../convex/_generated/api";
import { Doc, Id } from "@/../convex/_generated/dataModel";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";
import { Loader2, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const pegawaiSchema = z.object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
    nip: z.string().min(1, "NIP tidak boleh kosong"),
    bidangId: z.string().min(1, "Seksi harus dipilih"),
});

type PegawaiType = Doc<"pegawai">;

export function PegawaiManager() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [editingPegawai, setEditingPegawai] = useState<PegawaiType | null>(null);
    const [pegawaiToDelete, setPegawaiToDelete] = useState<PegawaiType | null>(null);
    const [selectedBidang, setSelectedBidang] = useState<string>("all");

    const bidangList = useQuery(api.bidang.getBidang);
    const { results: pegawaiList, status, loadMore } = usePaginatedQuery(
        api.workers.getPaginationWorker,
        selectedBidang === "all"
            ? {}
            : { bidangId: selectedBidang as Id<"bidang"> },
        { initialNumItems: 10 }
    );

    const createPegawai = useMutation(api.workers.createWorker);
    const updatePegawai = useMutation(api.workers.updateWorker);
    const deletePegawai = useMutation(api.workers.deleteWorker);

    const form = useForm<z.infer<typeof pegawaiSchema>>({
        resolver: zodResolver(pegawaiSchema),
        defaultValues: { name: "", nip: "", bidangId: "" },
    });

    function handleEditClick(pegawai: PegawaiType) {
        setEditingPegawai(pegawai);
        form.setValue("name", pegawai.name);
        form.setValue("nip", pegawai.nip);
        form.setValue("bidangId", pegawai.bidangId);
        setIsDialogOpen(true);
    }

    function handleAddClick() {
        setEditingPegawai(null);
        form.reset();
        setIsDialogOpen(true);
    }

    function handleDeleteClick(pegawai: PegawaiType) {
        setPegawaiToDelete(pegawai);
        setIsConfirmDeleteOpen(true);
    }

    async function onConfirmDelete() {
        if (!pegawaiToDelete) return;

        try {
            await deletePegawai({ workerId: pegawaiToDelete._id });
            toast.success("Sukses", { description: "Pegawai berhasil dihapus." });
            setIsConfirmDeleteOpen(false);
            setPegawaiToDelete(null);
        } catch {
            toast.error("Error.", { description: "Gagal menghapus pegawai." });
        }
    }

    async function onSubmit(values: z.infer<typeof pegawaiSchema>) {
        try {
            if (editingPegawai) {
                await updatePegawai({
                    workerId: editingPegawai._id,
                    ...values,
                    bidangId: values.bidangId as Id<"bidang">,
                });
                toast.success("Sukses", { description: "Data pegawai berhasil diperbarui." });
            } else {
                await createPegawai({
                    ...values,
                    bidangId: values.bidangId as Id<"bidang">,
                });
                toast.success("Sukses", { description: "Pegawai baru berhasil ditambahkan." });
            }
            form.reset();
            setIsDialogOpen(false);
            setEditingPegawai(null);
        } catch {
            toast.error("Error", { description: "Operasi gagal." });
        }
    }

    return (
        <div className="w-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold">Manajemen Kepegawaian</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Select value={selectedBidang} onValueChange={setSelectedBidang}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter berdasarkan bidang..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Seksi</SelectItem>
                            {bidangList?.map((bidang) => (
                                <SelectItem key={bidang._id} value={bidang._id}>
                                    {bidang.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAddClick}>+ Tambah Pegawai</Button>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPegawai ? "Edit Data Pegawai" : "Tambah Pegawai Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Pegawai</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cth: Budi Sanjaya" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="nip"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NIP</FormLabel>
                                        <FormControl>
                                            <Input placeholder="cth: 199001012020121001" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="bidangId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Kerja</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih unit kerja..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {bidangList?.map((bidang) => (
                                                    <SelectItem key={bidang._id} value={bidang._id}>
                                                        {bidang.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="mt-8">
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Batal</Button>
                                </DialogClose>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Simpan
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda Yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Aksi ini akan menghapus data pegawai {pegawaiToDelete?.name} secara permanen. Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDelete}>Lanjutkan</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {pegawaiList === undefined ? (
                <div className="flex justify-center items-center h-24">
                    <Loader2 className="w-6 h-6 animate-spin" />
                </div>
            ) : (
                <>
                    <div className="rounded-md border overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead className="hidden sm:table-cell">NIP</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pegawaiList?.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            Tidak menemukan pegawai.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {pegawaiList?.map((pegawai) => (
                                    <TableRow key={pegawai._id}>
                                        <TableCell className="font-medium">{pegawai.name}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{pegawai.nip}</TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleEditClick(pegawai)}>
                                                <PencilIcon className="w-4 h-4" />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(pegawai)}>
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
                </>
            )}
        </div>
    );
}