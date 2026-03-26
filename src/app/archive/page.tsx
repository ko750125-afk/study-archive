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
        <section className="mb-8">
          <h2
            className="text-3xl font-extrabold text-[#2b3437] mb-1"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            전체 자료
          </h2>
          <p className="text-[#586064]">총 {items.length}개의 학습 자료</p>
        </section>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex gap-2 flex-wrap">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                onClick={() => setTypeFilter(f.value)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  typeFilter === f.value
                    ? "bg-[#476363] text-white shadow-sm"
                    : "bg-white text-[#586064] hover:bg-[#eaeff1] border border-[#e3e9ec]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="sm:ml-auto">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 bg-white border border-[#e3e9ec] rounded-full text-sm text-[#586064] outline-none focus:ring-2 focus:ring-[#476363]/20"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
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
