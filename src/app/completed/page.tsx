"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ArchiveItem } from "@/lib/types";
import { ItemDetailModal } from "@/components/ItemDetailModal";

export default function CompletedPage() {
  const items = useStore((s) => s.items);
  const updateItem = useStore((s) => s.updateItem);
  const deleteItem = useStore((s) => s.deleteItem);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ArchiveItem | null>(null);

  // 학습완료 항목만 필터링
  const completedItems = items
    .filter(
      (i) =>
        i.isCompleted &&
        (!search ||
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.content.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => b.updatedAt - a.updatedAt); // 최근 완료순

  // 학습완료 취소 (전체자료로 복귀)
  const handleRestore = async (item: ArchiveItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await updateItem(item.id, { isCompleted: false });
  };

  // 영구 삭제
  const handleDelete = async (item: ArchiveItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`"${item.title}" 자료를 영구 삭제하시겠습니까?`)) {
      await deleteItem(item.id);
    }
  };

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
            placeholder="완료된 자료 검색..."
            className="w-full pl-10 pr-4 py-2 bg-[#eaeff1] rounded-full text-sm text-[#2b3437] placeholder:text-[#abb3b7] outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </header>

      <main className="p-5 md:p-8 pb-24 md:pb-8">
        {/* 페이지 헤더 */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center shadow-sm ring-1 ring-emerald-200/50">
              <span className="material-symbols-outlined text-emerald-500 text-[32px] material-symbols-filled">
                task_alt
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight">
                학습완료
              </h1>
              <p className="text-[#586064] font-medium">
                총 <span className="text-emerald-600 font-black">{completedItems.length}</span>개의 자료를 완료했습니다 🎉
              </p>
            </div>
          </div>

          {/* 안내 배너 */}
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-500 text-[20px] shrink-0 mt-0.5">info</span>
            <p className="text-sm text-emerald-800 font-medium leading-relaxed">
              완료된 자료는 <strong>전체자료</strong>와 <strong>학습할자료</strong>에서 자동으로 숨겨집니다.
              복구하려면 <strong>↩ 복구</strong> 버튼을 누르세요.
            </p>
          </div>
        </header>

        {/* 항목 없음 상태 */}
        {completedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh] text-center animate-fade-in">
            <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-50 flex items-center justify-center mb-8 shadow-inner ring-1 ring-emerald-200/50">
              <span className="material-symbols-outlined text-emerald-400 text-[48px] material-symbols-filled">
                task_alt
              </span>
            </div>
            <h3 className="text-2xl font-black text-[#1d1d1f] mb-3">
              {search ? `"${search}"에 대한 결과가 없습니다` : "완료된 자료가 없습니다"}
            </h3>
            <p className="text-[#586064] font-medium max-w-sm leading-relaxed opacity-70">
              카드의 ✅ 버튼을 눌러 학습을 완료로 표시해 보세요.
            </p>
          </div>
        ) : (
          /* 완료 목록 그리드 */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedItems.map((item) => (
              <CompletedCard
                key={item.id}
                item={item}
                onOpen={setSelected}
                onRestore={handleRestore}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {selected && (
        <ItemDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

/* ──────────────────────────────────────────
   완료 자료 카드 컴포넌트
────────────────────────────────────────── */
interface CompletedCardProps {
  item: ArchiveItem;
  onOpen: (item: ArchiveItem) => void;
  onRestore: (item: ArchiveItem, e: React.MouseEvent) => void;
  onDelete: (item: ArchiveItem, e: React.MouseEvent) => void;
}

function CompletedCard({ item, onOpen, onRestore, onDelete }: CompletedCardProps) {
  const typeIcons: Record<string, string> = {
    url: "language",
    image: "image",
    text: "description",
    notion: "menu_book",
  };

  const typeColors: Record<string, string> = {
    url: "text-blue-400 bg-blue-50",
    image: "text-purple-400 bg-purple-50",
    text: "text-amber-400 bg-amber-50",
    notion: "text-emerald-400 bg-emerald-50",
  };

  return (
    <div
      onClick={() => onOpen(item)}
      className="group relative flex flex-col bg-white/70 rounded-[2rem] p-6 border border-emerald-100 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* 완료 표시 배지 */}
      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
        <span className="material-symbols-outlined text-[14px] material-symbols-filled">check_circle</span>
        완료
      </div>

      {/* 아이콘과 날짜 */}
      <div className="flex items-start justify-between mb-4 mt-7">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center opacity-60 ${typeColors[item.type] || "text-gray-400 bg-gray-50"}`}>
          <span className="material-symbols-outlined text-[22px]">
            {typeIcons[item.type] || "article"}
          </span>
        </div>
        <p className="text-[11px] font-bold text-on-surface-variant/40">
          {new Date(item.updatedAt).toLocaleDateString("ko-KR", {
            month: "short",
            day: "numeric",
          })} 완료
        </p>
      </div>

      {/* 제목 & 내용 */}
      <div className="flex-grow">
        <h4 className="text-lg font-black text-[#1d1d1f]/70 leading-tight tracking-tight line-clamp-2 mb-2">
          {item.title || "제목 없는 자료"}
        </h4>
        <p className="text-[12px] text-[#586064]/50 leading-relaxed line-clamp-2 font-medium">
          {item.content || "내용 없음"}
        </p>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-emerald-50">
        {/* 복구 버튼 */}
        <button
          onClick={(e) => onRestore(item, e)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-100"
          title="전체자료로 복구"
        >
          <span className="material-symbols-outlined text-[16px]">undo</span>
          복구
        </button>

        {/* 영구 삭제 버튼 */}
        <button
          onClick={(e) => onDelete(item, e)}
          className="flex items-center justify-center w-10 h-10 bg-red-50 text-red-400 rounded-xl text-xs font-black hover:bg-red-100 hover:text-red-500 active:scale-95 transition-all border border-red-100"
          title="영구 삭제"
        >
          <span className="material-symbols-outlined text-[18px]">delete_outline</span>
        </button>
      </div>
    </div>
  );
}
