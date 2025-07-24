"use client";

import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { HardHat, PersonStanding, Star, History } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { name: "Admin", href: "/dashboard/admin", icon: PersonStanding },
    { name: "Users Manager", href: "/dashboard/users", icon: PersonStanding },
    { name: "Kepala Seksi", href: "/dashboard/leader", icon: HardHat },
    { name: "Atasan", href: "/dashboard/superior", icon: Star },
    { name: "Riwayat Penilaian", href: "/dashboard/riwayat_penilaian", icon: History },
];

export function SideNav() {
    const pathname = usePathname();

    return (
        <nav className="grid items-start text-sm font-medium">
            {links.map((link) => (
                <Link key={link.name} href={link.href}>
                    <Button
                        variant="ghost"
                        className={clsx("w-full justify-start gap-2", {
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