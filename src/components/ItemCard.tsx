"use client";

import { ArchiveItem } from "@/lib/types";

interface ItemCardProps {
  item: ArchiveItem;
  onOpen: (item: ArchiveItem) => void;
}

export function ItemCard({ item, onOpen }: ItemCardProps) {
  const typeIcons: Record<string, string> = {
    url: "language",
    image: "image",
    text: "description",
    notion: "menu_book",
  };

  const typeColors: Record<string, string> = {
    url: "text-blue-500 bg-blue-500/10",
    image: "text-purple-500 bg-purple-500/10",
    text: "text-amber-500 bg-amber-500/10",
    notion: "text-emerald-500 bg-emerald-500/10",
  };

  return (
    <div
      onClick={() => onOpen(item)}
      className="group relative flex flex-col h-full bg-white rounded-[2.5rem] p-7 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1 border border-outline-variant/30 hover:border-primary/20 cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top Header: Type Icon & Date */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${typeColors[item.type] || "text-on-surface-variant bg-surface-container-highest"}`}>
          <span className="material-symbols-outlined text-[26px] material-symbols-filled">
            {typeIcons[item.type] || "article"}
          </span>
        </div>
        
        <div className="text-right">
          <p className="text-[9px] font-black tracking-[0.2em] text-on-surface-variant/30 uppercase mb-0.5">
            Captured
          </p>
          <p className="text-[11px] font-bold text-on-surface-variant/60">
            {new Date(item.createdAt).toLocaleDateString("ko-KR", { month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, '')}
          </p>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow space-y-3 relative z-10">
        <h4 className="text-xl font-black text-on-surface leading-[1.3] tracking-tight group-hover:text-primary transition-colors line-clamp-2">
          {item.title || "제목 없는 자료"}
        </h4>
        
        <p className="text-[13px] text-on-surface-variant/60 leading-relaxed line-clamp-3 font-medium">
          {item.content || "추가 설명이 없습니다."}
        </p>
      </div>

      {/* Footer: Tags & Indicators */}
      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between relative z-10">
        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
          {item.tags.length > 0 ? (
            item.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[10px] font-bold text-primary/60 bg-primary-50/50 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-primary/5">
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[10px] font-bold text-on-surface-variant/20 italic">No Tags</span>
          )}
          {item.tags.length > 2 && (
            <span className="text-[10px] font-black text-on-surface-variant/30 px-1">
              +{item.tags.length - 2}
            </span>
          )}
        </div>

        {/* Sub-items Indicator */}
        {item.subItems && item.subItems.length > 0 && (
          <div className="flex items-center gap-1.5 text-primary bg-primary-50 px-3 py-1.5 rounded-xl ring-1 ring-primary/10">
            <span className="material-symbols-outlined text-[16px] material-symbols-filled">account_tree</span>
            <span className="text-[11px] font-black">{item.subItems.length}</span>
          </div>
        )}
      </div>

      {/* Action Hover Indicator */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shadow-2xl shadow-primary/30">
        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
      </div>
    </div>
  );
}
