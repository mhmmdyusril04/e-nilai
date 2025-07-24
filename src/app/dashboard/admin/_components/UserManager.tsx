"use client";

import { api } from "@/../convex/_generated/api";
import { Doc, Id } from "@/../convex/_generated/dataModel";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, PencilIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";

const userRoleSchema = z
  .object({
    name: z.string().min(1, "Nama tidak boleh kosong"),
    role: z.enum(["ketua_bidang", "atasan", "admin"]),
    bidangId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (
        (data.role === "ketua_bidang" || data.role === "atasan") &&
        !data.bidangId
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Kepala Seksi dan Atasan harus memilih unit kerja",
      path: ["bidangId"],
    }
  );

type UserType = Doc<"users"> & { bidangName?: string };

const ITEMS_PER_PAGE = 10;

export function UserManager() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);

  const {
    results: userList,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.users.getPaginatedUsers,
    {},
    { initialNumItems: ITEMS_PER_PAGE }
  );

  const bidangList = useQuery(api.bidang.getBidang);
  const updateUserRole = useMutation(api.users.updateUserRoleByAdmin);

  const form = useForm<z.infer<typeof userRoleSchema>>({
    resolver: zodResolver(userRoleSchema),
  });

  const selectedRole = form.watch("role");

  const usersWithBidangName = userList?.map((user) => {
    const bidang = bidangList?.find((b) => b._id === user.bidangId);
    return { ...user, bidangName: bidang?.name };
  });

  function handleEditClick(user: UserType) {
    setEditingUser(user);
    form.reset({
      name: user.name || "",
      role: user.role,
      bidangId: user.bidangId,
    });
    setIsDialogOpen(true);
  }

  async function onSubmit(values: z.infer<typeof userRoleSchema>) {
    if (!editingUser) return;
    try {
      await updateUserRole({
        userId: editingUser._id,
        name: values.name,
        role: values.role,
        bidangId: values.bidangId as Id<"bidang"> | undefined,
      });
      toast.success("Sukses", {
        description: `Peran untuk ${editingUser.name} berhasil diperbarui.`,
      });
      setIsDialogOpen(false);
      setEditingUser(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast.error("Error", {
        description: error.data || "Gagal memperbarui peran.",
      });
    }
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Manajemen Pengguna</h2>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-screen overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Peran: {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pengguna</FormLabel>
                    <FormControl>
                      <Input placeholder="Masukkan nama pengguna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peran (Role)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="atasan">Atasan</SelectItem>
                        <SelectItem value="ketua_bidang">
                          Kepala Seksi
                        </SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(selectedRole === "ketua_bidang" ||
                selectedRole === "atasan") && (
                <FormField
                  control={form.control}
                  name="bidangId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Kerja</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
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
              )}
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
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Unit Kerja</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userList === undefined && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            )}
            {usersWithBidangName?.map((user) => (
              <TableRow key={user._id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.bidangName || "-"}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(user)}
                  >
                    <PencilIcon className="w-4 h-4" /> Edit
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-center mt-4">
        <Button
          onClick={() => loadMore(ITEMS_PER_PAGE)}
          disabled={status !== "CanLoadMore"}
          variant="ghost"
          size="sm"
        >
          {status === "LoadingMore" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {status === "CanLoadMore"
            ? "Tampilkan Lebih Banyak"
            : "Tidak ada data lagi"}
        </Button>
      </div>
    </div>
  );
}
