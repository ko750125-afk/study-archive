"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { ArchiveItem } from "@/lib/types";
import { ItemCard } from "@/components/ItemCard";
import { AddItemModal } from "@/components/AddItemModal";
import { ItemDetailModal } from "@/components/ItemDetailModal";

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
  ).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-100 selection:text-primary-900">
      {/* Top App Bar */}
      <header className="sticky top-0 z-40 glass-panel px-6 md:px-10 py-4 flex items-center gap-6 border-b border-outline-variant/30">
        <div className="flex-1 relative group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-[22px] transition-colors group-focus-within:text-primary">
            search
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="지식 공간 검색..."
            className="w-full pl-12 pr-6 py-3 bg-surface-container-low/50 rounded-2xl text-sm text-on-surface font-medium placeholder:text-on-surface-variant/40 outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden sm:inline">새 자료 추가</span>
        </button>
      </header>

      <main className="p-6 md:p-10 pb-24 md:pb-12 max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-4xl font-black text-primary tracking-tight mb-2">
            오늘의 통찰
          </h2>
          <div className="flex items-center gap-2 text-on-surface-variant font-semibold opacity-70">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </section>

        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary animate-pulse">워크스페이스 초기화 중...</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <div className="space-y-12">
            {/* Bento Grid: Main Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Archive Section */}
              <section className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-2 h-8 rounded-full bg-primary" />
                  <h3 className="text-xl font-bold text-on-surface">Knowledge Archive</h3>
                  <span className="ml-auto text-xs font-black text-primary bg-primary-50 px-3 py-1.5 rounded-full ring-1 ring-primary/10">
                    {filtered.length} ITEMS
                  </span>
                </div>

                {filtered.length === 0 ? (
                  <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-outline-variant/30 bg-surface-container-lowest/50 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 text-on-surface-variant/20">
                      <span className="material-symbols-outlined text-4xl">inventory</span>
                    </div>
                    <p className="text-on-surface-variant font-bold">저장된 자료가 없습니다.</p>
                    <p className="text-xs text-on-surface-variant/60">새로운 지식을 캡처하여 이곳을 채워보세요.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {filtered.map((item) => (
                      <ItemCard key={item.id} item={item} onOpen={setSelected} />
                    ))}
                  </div>
                )}
              </section>

              {/* Learning Pattern Bento Card */}
              <aside className="lg:col-span-4 sticky top-28">
                <PatternAnalysisCard totalCount={items.length} />
              </aside>
            </div>
          </div>
        )}
      </main>

      {/* FAB (mobile) */}
      <button
        onClick={() => setShowAdd(true)}
        className="md:hidden fixed bottom-24 right-6 w-16 h-16 bg-primary text-white rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 border-4 border-white"
      >
        <span className="material-symbols-outlined text-[28px] material-symbols-filled">add</span>
      </button>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
      {selected && (
        <ItemDetailModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}

function PatternAnalysisCard({ totalCount }: { totalCount: number }) {
  // 예시 데이터: 실제로는 데이터에 기반하여 계산 가능
  const retentionProgress = 85; 
  
  return (
    <div className="p-8 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/20 overflow-hidden relative group">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </div>
          <h4 className="font-bold text-lg tracking-tight">지식 성장 패턴</h4>
        </div>

        <div className="space-y-1">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">지식 유지율</p>
          <div className="text-4xl font-black">{retentionProgress}%</div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out" 
              style={{ width: `${retentionProgress}%` }}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-white/70 font-medium">
            현재 매우 안정적인 지식 습득 패턴을 보이고 있습니다. <span className="text-white font-bold">{totalCount}개의 지식</span>이 디지털 뇌에 성공적으로 저장되었습니다.
          </p>
        </div>

        <button className="w-full py-3 bg-white text-primary rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/90 active:scale-95 transition-all">
          상세 분석 리포트 보기
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
      <div className="w-24 h-24 rounded-[2.5rem] bg-primary-50 flex items-center justify-center mb-8 shadow-inner ring-1 ring-primary/10">
        <span className="material-symbols-outlined text-primary text-[48px] material-symbols-filled">
          auto_stories
        </span>
      </div>
      <h3 className="text-3xl font-black text-on-surface mb-3 tracking-tight">
        아직 보관함이 비어있습니다
      </h3>
      <p className="text-on-surface-variant font-medium mb-10 max-w-sm leading-relaxed opacity-60">
        학습한 영상, 블로그 링크, 혹은 떠오르는 아이디어를 캡처해 보세요. 당신만의 지식 아카이브가 이곳에서 시작됩니다.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-wider text-xs hover:bg-primary-600 active:scale-95 transition-all shadow-2xl shadow-primary/30"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        첫 자료 추가하기
      </button>
    </div>
  );
}
