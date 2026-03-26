"use client";

import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/", icon: "home", label: "대시보드" },
  { href: "/archive", icon: "inventory_2", label: "전체 자료" },
  { href: "/add", icon: "add_circle", label: "자료 추가" },
];

export function Sidebar() {
  const pathname = usePathname();
  const isConnected = useStore((s) => s.isConnected);
  const items = useStore((s) => s.items);

  const highPriority = items.filter((i) => i.priority === "high").length;
  const total = items.length;

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div className="md:hidden" />

      <aside className="hidden md:flex h-screen w-64 fixed left-0 top-0 flex-col bg-[#eaeff1] z-50">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-black/5">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#476363] flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">
                auto_stories
              </span>
            </div>
            <h1
              className="text-[17px] font-extrabold text-[#476363]"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              학습 아카이브
            </h1>
          </div>
          <p className="text-[11px] text-[#586064] font-medium ml-10.5">
            개인 학습 공간
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-grow p-3 space-y-1">
          {navItems.map(({ href, icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-[#476363] shadow-sm"
                    : "text-[#586064] hover:bg-white/60"
                }`}
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? "text-[#476363]" : "text-[#737c7f]"
                  }`}
                >
                  {icon}
                </span>
                {label}
              </Link>
            );
          })}

          {/* Stats */}
          <div className="mt-6 pt-4 border-t border-black/5 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-[#737c7f] px-3 mb-3">
              현황
            </p>
            <div className="px-3 py-2.5 rounded-xl bg-white/60 space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#586064]">전체 자료</span>
                <span className="text-xs font-bold text-[#2b3437]">{total}개</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#586064]">우선 학습</span>
                <span className="text-xs font-bold text-[#476363]">
                  {highPriority}개
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Bottom: status + settings */}
        <div className="p-3 border-t border-black/5 space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
            <span className="text-xs text-[#586064]">
              {isConnected ? "클라우드 연결됨" : "로컬 저장 중"}
            </span>
          </div>
          <Link
            href="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#586064] hover:bg-white/60 transition-all"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            <span className="material-symbols-outlined text-[20px] text-[#737c7f]">
              settings
            </span>
            설정
          </Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#eaeff1] flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all ${
                isActive ? "text-[#476363]" : "text-[#737c7f]"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${
                  isActive ? "material-symbols-filled text-[#476363]" : ""
                }`}
              >
                {icon}
              </span>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
