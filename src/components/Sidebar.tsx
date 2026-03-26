"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

export function Sidebar() {
  const pathname = usePathname();
  const items = useStore((s) => s.items);

  const menuItems = [
    { id: "dashboard", icon: "dashboard", label: "대시보드", href: "/" },
    { id: "archive", icon: "inventory_2", label: "학습할 자료", href: "/archive" },
    { id: "tags", icon: "tag", label: "태그 관리", href: "/tags" },
  ];

  const bottomItems: { id: string; icon: string; label: string; href: string }[] = [];

  const total = items.length;
  // Simple usage calculation for demo
  const usage = Math.min(Math.round((total / 100) * 100), 100);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant/30 p-6 z-50">
        <div className="flex items-center gap-3 px-3 mb-12">
          <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <span className="material-symbols-outlined text-[24px] material-symbols-filled">
              auto_stories
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-black tracking-tight text-on-surface leading-none truncate">
              Study Archive
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mt-1">
              v2.0 Beta
            </p>
          </div>
        </div>

        <nav className="flex-grow space-y-1.5 overflow-y-auto custom-scrollbar pr-2">
          <p className="px-4 text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-30 mb-3">
            Menu
          </p>
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                pathname === item.href
                  ? "bg-primary text-white shadow-xl shadow-primary/20 scale-100"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className={`material-symbols-outlined text-[22px] transition-transform duration-500 ${
                pathname === item.href ? "material-symbols-filled scale-110" : "group-hover:scale-110"
              }`}>
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-tight">
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 mt-6 border-t border-outline-variant/30 space-y-1.5">
          {bottomItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                pathname === item.href
                  ? "bg-primary text-white shadow-xl shadow-primary/10"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[22px] group-hover:rotate-12 transition-transform">
                {item.icon}
              </span>
              <span className="text-sm font-bold tracking-tight">
                {item.label}
              </span>
            </Link>
          ))}

          <div className="mt-8 p-6 rounded-3xl bg-surface-container-low border border-outline-variant/30 relative overflow-hidden group hover:border-primary/20 transition-all">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="relative z-10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mb-1">
              Storage Usage
            </p>
            <div className="relative z-10 flex items-baseline gap-1">
              <span className="text-lg font-black text-on-surface">{usage}</span>
              <span className="text-[10px] font-bold text-on-surface-variant opacity-60">% FULL</span>
            </div>
            <div className="relative z-10 w-full h-1 bg-surface-container-high rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)] transition-all duration-1000" 
                style={{ width: `${usage}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-outline-variant/30 px-6 py-4 flex items-center justify-around z-50 pb-safe">
        {menuItems.slice(0, 4).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              pathname === item.href ? "text-primary scale-110" : "text-on-surface-variant/60"
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${
              pathname === item.href ? "material-symbols-filled" : ""
            }`}>
              {item.icon}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
    </>
  );
}
