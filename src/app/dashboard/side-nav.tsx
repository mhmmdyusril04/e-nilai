"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { HardHat, PersonStanding, Star, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthRole } from "@/app/hooks/useAuthRole"; // ⬅️ Tambahkan ini

const links = [
  {
    name: "Admin",
    href: "/dashboard/admin",
    icon: PersonStanding,
    roles: ["admin"],
  },
  {
    name: "Users Manager",
    href: "/dashboard/users",
    icon: PersonStanding,
    roles: ["admin"],
  },
  {
    name: "Pejabat Penilai",
    href: "/dashboard/leader",
    icon: HardHat,
    roles: ["ketua_bidang", "admin"],
  },
  {
    name: "Pejabat Penilai 2",
    href: "/dashboard/superior",
    icon: Star,
    roles: ["atasan", "admin"],
  },
  {
    name: "Riwayat Penilaian",
    href: "/dashboard/riwayat_penilaian",
    icon: History,
    roles: ["admin", "atasan"],
  },
];

export function SideNav() {
  const pathname = usePathname();
  const { role, isLoading } = useAuthRole(); // ⬅️ Ambil role dari hook

  if (isLoading) return null;

  return (
    <nav className="grid items-start text-sm font-medium gap-2">
      {links
        .filter((link) => link.roles.includes(role)) // ⬅️ Filter sesuai role
        .map((link) => (
          <Link key={link.name} href={link.href}>
            <Button
              variant="ghost"
              className={clsx("w-full justify-start gap-2 text-white", {
                "bg-muted text-primary": pathname.startsWith(link.href),
              })}
            >
              <link.icon className="h-4 w-4" />
              {link.name}
            </Button>
          </Link>
        ))}
    </nav>
  );
}
