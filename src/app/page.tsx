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
            placeholder="Search your knowledge space..."
            className="w-full pl-12 pr-6 py-3 bg-surface-container-low/50 rounded-2xl text-sm text-on-surface font-medium placeholder:text-on-surface-variant/40 outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all border border-transparent focus:border-primary/20"
          />
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl text-sm font-bold hover:bg-primary-600 active:scale-95 transition-all shadow-lg shadow-primary/20 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="hidden sm:inline">Capture</span>
        </button>
      </header>

      <main className="p-6 md:p-10 pb-24 md:pb-12 max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <section className="mb-12 animate-fade-in">
          <h2 className="text-4xl font-black text-primary tracking-tight mb-2">
            Today's Insight
          </h2>
          <div className="flex items-center gap-2 text-on-surface-variant font-semibold opacity-70">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </div>
        </section>

        {!isLoaded ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm font-bold text-primary animate-pulse">Initializing Workspace...</p>
          </div>
        ) : items.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} />
        ) : (
          <div className="space-y-12">
            {/* Bento Grid: Active Learning */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Priority Section */}
              <section className="lg:col-span-8 space-y-6">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-2 h-8 rounded-full bg-primary" />
                  <h3 className="text-xl font-bold text-on-surface">Focus Required</h3>
                  <span className="ml-auto text-xs font-black text-primary bg-primary-50 px-3 py-1.5 rounded-full ring-1 ring-primary/10">
                    {priority.length} ACTIVE
                  </span>
                </div>

                {priority.length === 0 ? (
                  <div className="p-12 rounded-[2.5rem] border-2 border-dashed border-outline-variant/50 bg-surface-container-lowest/50 text-center space-y-3 group hover:border-primary/30 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-4 text-on-surface-variant/20 group-hover:text-primary/40 transition-colors">
                      <span className="material-symbols-outlined text-4xl">inventory</span>
                    </div>
                    <p className="text-on-surface-variant font-bold">Your focus list is clear</p>
                    <p className="text-xs text-on-surface-variant/60">Mark items with high priority to see them here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
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

              {/* Learning Pattern Bento Card */}
              <aside className="lg:col-span-4 sticky top-28">
                <PatternAnalysisCard totalCount={items.length} priorityCount={priority.length} />
              </aside>
            </div>

            {/* Archive Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-2 h-8 rounded-full bg-on-surface-variant/30" />
                <h3 className="text-xl font-bold text-on-surface">Knowledge Archive</h3>
                <span className="ml-auto text-xs font-black text-on-surface-variant bg-surface-container-highest px-3 py-1.5 rounded-full">
                  {archived.length} ITEMS
                </span>
              </div>

              {archived.length === 0 && priority.length > 0 ? (
                <div className="p-12 rounded-[2.5rem] bg-surface-container-low/30 border border-outline-variant/30 text-center">
                  <p className="text-sm font-bold text-on-surface-variant opacity-50 italic">Everything is currently in focus</p>
                </div>
              ) : archived.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant/40 italic font-medium">No archived materials yet</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

function PatternAnalysisCard({ totalCount, priorityCount }: { totalCount: number, priorityCount: number }) {
  const completionRate = totalCount > 0 ? Math.round(((totalCount - priorityCount) / totalCount) * 100) : 0;
  
  return (
    <div className="p-8 rounded-[2.5rem] bg-primary text-white shadow-2xl shadow-primary/20 overflow-hidden relative group">
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700" />
      
      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <span className="material-symbols-outlined text-[20px]">insights</span>
          </div>
          <h4 className="font-bold text-lg tracking-tight">Growth Pattern</h4>
        </div>

        <div className="space-y-1">
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Efficiency</p>
          <div className="text-4xl font-black">{completionRate}%</div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-1000 ease-out" 
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-[11px] leading-relaxed text-white/70 font-medium">
            Currently maintaining a high retention rate. You have <span className="text-white font-bold">{priorityCount} items</span> that require immediate attention.
          </p>
        </div>

        <button className="w-full py-3 bg-white text-primary rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-white/90 active:scale-95 transition-all">
          View Detailed Analytics
        </button>
      </div>
    </div>
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
    high: "bg-red-50 text-red-600 ring-1 ring-red-100",
    medium: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    low: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    none: "bg-surface-container text-on-surface-variant",
  };
  const priorityLabels: Record<Priority, string> = {
    high: "Urgent",
    medium: "Normal",
    low: "Later",
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
      className="group flex items-center gap-5 p-5 bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-outline-variant/30 hover:border-primary/20 cursor-pointer animate-fade-in"
      onClick={() => onOpen(item)}
    >
      <div
        className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${
          item.type === "url"
            ? "bg-primary-50 text-primary"
            : item.type === "image"
            ? "bg-secondary-50 text-secondary"
            : "bg-surface-container-highest text-on-surface-variant"
        }`}
      >
        <span className="material-symbols-outlined text-[22px]">
          {typeIcons[item.type] || "article"}
        </span>
      </div>
      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-on-surface text-base leading-tight truncate">
          {item.title || "Untitled Insight"}
        </h4>
        <div className="flex items-center gap-2 mt-1.5 overflow-hidden">
          <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant opacity-40 shrink-0">
            {item.type}
          </p>
          <div className="flex gap-1.5 truncate">
            {item.tags.map(t => (
              <span key={t} className="text-[10px] text-primary/60 font-medium">#{t}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateItem(item.id, { priority: cycledPriority[item.priority] });
          }}
          className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-[0.1em] transition-all hover:scale-105 active:scale-95 ${priorityColors[item.priority]}`}
        >
          {priorityLabels[item.priority]}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl hover:bg-red-50 text-on-surface-variant/40 hover:text-red-500 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
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
        Your Space is Empty
      </h3>
      <p className="text-on-surface-variant font-medium mb-10 max-w-sm leading-relaxed opacity-60">
        Start by capturing links, images, or notes. Your personal learning archive begins with a single thought.
      </p>
      <button
        onClick={onAdd}
        className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-wider text-xs hover:bg-primary-600 active:scale-95 transition-all shadow-2xl shadow-primary/30"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Initialize Archive
      </button>
    </div>
  );
}
