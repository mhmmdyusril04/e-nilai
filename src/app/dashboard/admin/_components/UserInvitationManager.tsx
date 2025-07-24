"use client";

import { api } from "@/../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Id } from "../../../../../convex/_generated/dataModel";

const invitationSchema = z.object({
    email: z.string().email("Format email tidak valid"),
    role: z.enum(["ketua_bidang", "atasan", "admin"]),
    bidangId: z.string().optional(),
}).refine(data => {
    if ((data.role === 'ketua_bidang' || data.role === 'atasan') && !data.bidangId) {
        return false;
    }
    return true;
}, {
    message: "Kepala Seksi dan Atasan harus memilih unit kerja",
    path: ["bidangId"],
});


export function UserInvitationManager() {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const sendInvitation = useAction(api.invitations.sendInvitation);
    const bidangList = useQuery(api.bidang.getBidang);

    const form = useForm<z.infer<typeof invitationSchema>>({
        resolver: zodResolver(invitationSchema),
        defaultValues: { email: "", role: "atasan" },
    });

    const selectedRole = form.watch("role");

    async function onSubmit(values: z.infer<typeof invitationSchema>) {
        try {
            await sendInvitation({
                ...values,
                bidangId: values.bidangId as Id<"bidang">,
            });
            toast.success("Sukses", { description: `Undangan berhasil dikirim ke ${values.email}` });
            form.reset();
            setIsDialogOpen(false);
        } catch {
            toast.error("Error", { description: "Gagal mengirim undangan. Pastikan email valid dan peran yang dipilih benar." });
        }
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button>+ Undang Pengguna</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Undang Pengguna Baru</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl><Input placeholder="email@contoh.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <FormField control={form.control} name="role" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Peran (Role)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="atasan">Atasan</SelectItem>
                                        <SelectItem value="ketua_bidang">Kepala Seksi</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {(selectedRole === 'ketua_bidang' || selectedRole === 'atasan') && (
                            <FormField control={form.control} name="bidangId" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bidang</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Pilih unit kerja..." /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {bidangList?.map((bidang) => (
                                                <SelectItem key={bidang._id} value={bidang._id}>{bidang.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        )}

                        <DialogFooter className="mt-4">
                            <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Kirim Undangan
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}