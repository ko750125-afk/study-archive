"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ArchiveItem, Priority } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";

const priorityOrder: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
  none: 3,
};

export default function DashboardPage() {
  const items = useStore((s) => s.items);
  const isLoaded = useStore((s) => s.isLoaded);
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<ArchiveItem | null>(null);
  const [search, setSearch] = useState("");

  const filtered = items.filter(
    (i) =>
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.content.toLowerCase().includes(search.toLowerCase()) ||
      i.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const priority = [...filtered]
    .filter((i) => i.priority !== "none")
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const archived = [...filtered]
    .filter((i) => i.priority === "none")
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <>
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 bg-[#f8f9fa]/90 backdrop-blur-md border-b border-[#eaeff1] px-5 md:px-8 py-3.5 flex items-center gap-4">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#abb3b7] text-[20px]">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="자료 검색..."
            className="w-full pl-10 pr-4 py-2 bg-[#eaeff1] rounded-full text-sm text-[#2b3437] placeholder:text-[#abb3b7] outline-none focus:bg-white focus:ring-2 focus:ring-[#476363]/20 transition-all"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#476363] text-white rounded-full text-sm font-semibold hover:bg-[#3c5757] active:scale-95 transition-all shadow-sm shrink-0"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span className="hidden sm:inline">자료 추가</span>
        </button>
      </header>

      <main className="p-5 md:p-8 pb-24 md:pb-8">
        {/* Hero */}
        <section className="mb-10">
          <h2
            className="text-3xl font-extrabold text-[#2b3437] mb-1"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            오늘의 학습
          </h2>
          <p className="text-[#586064]">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </section>

        {!isLoaded ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex items-center gap-3 text-[#586064]">
              <div className="w-5 h-5 border-2 border-[#476363] border-t-transparent rounded-full animate-spin" />
              불러오는 중...
            </div>
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Priority List */}
            <section className="lg:col-span-5">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-bold text-[#2b3437] flex items-center gap-2"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <span className="material-symbols-outlined text-[#9d4500] text-[20px]">
                    priority_high
                  </span>
                  우선 학습할 자료
                </h3>
                <span className="text-xs font-bold text-[#586064] bg-[#eaeff1] px-2.5 py-1 rounded-full">
                  {priority.length}개
                </span>
              </div>

              {priority.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#e3e9ec] text-[#abb3b7] text-sm">
                  우선 순위 자료가 없습니다
                  <br />
                  <span className="text-xs">카드의 배지를 클릭해 우선순위를 설정하세요</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {priority.map((item) => (
                    <PriorityRow
                      key={item.id}
                      item={item}
                      onOpen={setSelected}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Archive Grid */}
            <section className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-lg font-bold text-[#2b3437] flex items-center gap-2"
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  <span className="material-symbols-outlined text-[#737c7f] text-[20px]">
                    inventory_2
                  </span>
                  보관 중인 자료
                </h3>
                <span className="text-xs font-bold text-[#586064] bg-[#eaeff1] px-2.5 py-1 rounded-full">
                  {archived.length}개
                </span>
              </div>

              {archived.length === 0 ? (
                <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#e3e9ec] text-[#abb3b7] text-sm">
                  아직 자료가 없습니다
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {archived.map((item) => (
                    <ItemCard key={item.id} item={item} onOpen={setSelected} />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* FAB (mobile) */}
      <button
        onClick={() => setShowAdd(true)}
        className="md:hidden fixed bottom-20 right-5 w-14 h-14 bg-[#476363] text-white rounded-full shadow-2xl shadow-[#476363]/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40"
      >
        <span className="material-symbols-outlined text-[24px]">add</span>
      </button>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <ItemDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

function PriorityRow({
  item,
  onOpen,
}: {
  item: ArchiveItem;
  onOpen: (i: ArchiveItem) => void;
}) {
  const deleteItem = useStore((s) => s.deleteItem);
  const updateItem = useStore((s) => s.updateItem);

  const typeIcons: Record<string, string> = {
    url: "link",
    image: "image",
    text: "sticky_note_2",
    notion: "description",
  };
  const priorityColors: Record<Priority, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-emerald-100 text-emerald-700",
    none: "bg-[#eaeff1] text-[#586064]",
  };
  const priorityLabels: Record<Priority, string> = {
    high: "우선",
    medium: "보통",
    low: "나중에",
    none: "-",
  };
  const cycledPriority: Record<Priority, Priority> = {
    none: "high",
    high: "medium",
    medium: "low",
    low: "none",
  };

  return (
    <div
      className="group flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-[#cae8e8] cursor-pointer animate-fade-in"
      onClick={() => onOpen(item)}
    >
      <div
        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${
          item.type === "url"
            ? "bg-[#cae8e8] text-[#476363]"
            : item.type === "image"
            ? "bg-[#d6e7d7] text-[#546356]"
            : "bg-[#fd8a42]/15 text-[#9d4500]"
        }`}
      >
        <span className="material-symbols-outlined text-[18px]">
          {typeIcons[item.type] || "article"}
        </span>
      </div>
      <div className="flex-grow min-w-0">
        <h4
          className="font-semibold text-[#2b3437] text-sm leading-snug truncate"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {item.title || "(제목 없음)"}
        </h4>
        <p className="text-xs text-[#737c7f] mt-0.5">
          {item.tags.length > 0 ? item.tags.map((t) => `#${t}`).join(" ") : item.type}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateItem(item.id, { priority: cycledPriority[item.priority] });
          }}
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${priorityColors[item.priority]}`}
        >
          {priorityLabels[item.priority]}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-[#abb3b7] hover:text-red-500 transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#cae8e8] flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-[#476363] text-[40px]">
          auto_stories
        </span>
      </div>
      <h3
        className="text-2xl font-bold text-[#2b3437] mb-2"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        학습 아카이브가 비어있어요
      </h3>
      <p className="text-[#586064] mb-8 max-w-sm">
        유튜브 링크, 노션 자료, 이미지 등 학습에 필요한 자료를 여기에 모아보세요.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-2 px-8 py-4 bg-[#476363] text-white rounded-2xl font-bold hover:bg-[#3c5757] active:scale-95 transition-all shadow-lg shadow-[#476363]/20"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        <span className="material-symbols-outlined">add</span>
        첫 자료 추가하기
      </button>
    </div>
  );
}
