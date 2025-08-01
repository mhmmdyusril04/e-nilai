"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SideNav } from "./side-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col w-[220px] lg:w-[280px] bg-slate-800 text-white sticky top-0 h-screen z-30 border-r">
        <div className="flex items-center h-14 px-5 border-b">
          <h2 className="text-lg font-bold">Menu</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SideNav />
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex flex-col flex-1 h-200">
        {/* Header (desktop + mobile) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mx-7 my-3">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 bg-slate-800 text-white">
              <SheetTitle className="text-lg font-bold text-white">Menu</SheetTitle>
              <div className="mt-4">
                <SideNav />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
