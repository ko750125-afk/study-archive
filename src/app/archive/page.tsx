"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ArchiveItem } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";

const FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "전체", value: "all" },
  { label: "링크", value: "url" },
  { label: "이미지", value: "image" },
  { label: "텍스트", value: "text" },
  { label: "노션", value: "notion" },
];

const SORT_OPTIONS = [
  { label: "최신순", value: "latest" },
  { label: "오래된 순", value: "oldest" },
];

export default function ArchivePage() {
  const items = useStore((s) => s.items);
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort] = useState("latest");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<ArchiveItem | null>(null);

  const filtered = items
    .filter(
      (i) =>
        (typeFilter === "all" || i.type === typeFilter) &&
        (!search ||
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.content.toLowerCase().includes(search.toLowerCase()) ||
          i.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())))
    )
    .sort((a, b) => {
      if (sort === "oldest") return a.createdAt - b.createdAt;
      return b.createdAt - a.createdAt;
    });

  return (
    <>
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-[#f8f9fa]/90 backdrop-blur-md border-b border-[#eaeff1] px-5 md:px-8 py-3.5 flex items-center gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#abb3b7] text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="검색..."
            className="w-full pl-10 pr-4 py-2 bg-[#eaeff1] rounded-full text-sm text-[#2b3437] placeholder:text-[#abb3b7] outline-none focus:bg-white focus:ring-2 focus:ring-[#476363]/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#476363] text-white rounded-full text-sm font-semibold hover:bg-[#3c5757] active:scale-95 transition-all shadow-sm shrink-0"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">추가</span>
        </button>
      </header>

      <main className="p-5 md:p-8 pb-24 md:pb-8">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight mb-2">전체 자료</h1>
          <p className="text-[#586064]">총 {items.length}개의 학습 자료</p>
        </header>

        {/* Filter bar removed for minimalism */}
        <div className="flex justify-end mb-6">
          <div className="relative group">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none pl-5 pr-10 py-2.5 bg-white border border-[#e3e9ec] rounded-2xl text-sm font-bold text-[#586064] outline-none focus:ring-4 focus:ring-[#476363]/5 focus:border-[#476363]/30 transition-all cursor-pointer shadow-sm"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#abb3b7] text-[18px] pointer-events-none group-hover:text-[#476363] transition-colors">
              expand_more
            </span>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#abb3b7] text-sm">
            {search ? `"${search}"에 대한 결과가 없습니다` : "자료가 없습니다"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <ItemCard key={item.id} item={item} onOpen={setSelected} />
            ))}
          </div>
        )}
      </main>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <ItemDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
