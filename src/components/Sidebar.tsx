"use client";

import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", icon: "home", label: "Dashboard" },
  { href: "/archive", icon: "inventory_2", label: "Archive" },
  { href: "/add", icon: "add_circle", label: "Quick Add" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isConnected = useStore((s) => s.isConnected);
  const items = useStore((s) => s.items);

  const highPriority = items.filter((i) => i.priority === "high").length;
  const total = items.length;

  return (
    <>
      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col bg-surface/80 backdrop-blur-xl border-r border-outline-variant z-50">
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-white text-[22px]">
                auto_stories
              </span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary leading-tight">
                Study Archive
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold opacity-60">
                Workspace
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-grow p-4 space-y-1.5">
          {navItems.map(({ href, icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-primary-50 text-primary shadow-sm ring-1 ring-primary/10"
                    : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${
                    isActive ? "material-symbols-filled scale-110" : "opacity-70"
                  }`}
                >
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}

          <div className="mt-8 pt-6 border-t border-outline-variant/30 space-y-4">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/50 px-4">
              Overview
            </h3>
            <div className="mx-2 p-4 rounded-3xl bg-surface-container-low/50 border border-outline-variant/20 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
                  <span className="text-xs font-medium text-on-surface-variant">Total</span>
                </div>
                <span className="text-xs font-bold text-on-surface">{total}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-on-surface-variant">Priority</span>
                </div>
                <span className="text-xs font-bold text-primary">{highPriority}</span>
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-outline-variant/30 space-y-2">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-surface-container-highest/30">
            <div
              className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulse ${
                isConnected ? "bg-emerald-500 shadow-emerald-500/20" : "bg-amber-500 shadow-amber-500/20"
              }`}
            />
            <span className="text-[11px] font-bold text-on-surface-variant">
              {isConnected ? "Cloud Sync Active" : "Local Mode"}
            </span>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-[22px] opacity-70">
              settings
            </span>
            Settings
          </Link>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-xl border-t border-outline-variant flex items-center justify-around px-4 py-3 safe-area-pb">
        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${
                isActive ? "text-primary scale-110" : "text-on-surface-variant opacity-60"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[26px] ${
                  isActive ? "material-symbols-filled" : ""
                }`}
              >
                {icon}
              </span>
              <span className="text-[10px] font-bold">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
