"use client";

import { ArchiveItem, Priority } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useState } from "react";

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
  none: "bg-surface-container text-on-surface-variant/40",
};

const priorityLabels: Record<Priority, string> = {
  high: "Urgent",
  medium: "Normal",
  low: "Later",
  none: "-",
};

export function ItemCard({ item, onOpen }: { item: ArchiveItem; onOpen: (i: ArchiveItem) => void }) {
  const deleteItem = useStore((s) => s.deleteItem);
  const updateItem = useStore((s) => s.updateItem);
  const [showMenu, setShowMenu] = useState(false);

  const icon = typeIcons[item.type] || "article";

  const cycledPriority: Record<Priority, Priority> = {
    none: "high",
    high: "medium",
    medium: "low",
    low: "none",
  };

  return (
    <div
      className="group relative bg-white rounded-[2rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-outline-variant/30 hover:border-primary/20 cursor-pointer animate-fade-in overflow-hidden flex flex-col h-full"
      onClick={() => onOpen(item)}
    >
      {/* Thumbnail */}
      {item.thumbnail ? (
        <div className="h-44 overflow-hidden relative">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      ) : (
        <div className="h-4 shrink-0 bg-surface-container-low" />
      )}

      <div className="p-6 flex flex-col flex-grow">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              item.type === "url"
                ? "bg-primary-50 text-primary"
                : item.type === "image"
                ? "bg-secondary-50 text-secondary"
                : "bg-surface-container-highest text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateItem(item.id, { priority: cycledPriority[item.priority] });
              }}
              className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider transition-all hover:scale-105 ${
                priorityColors[item.priority]
              }`}
            >
              {priorityLabels[item.priority]}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-surface-container-highest text-on-surface-variant transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[20px]">more_horiz</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2 mb-4 flex-grow">
          <h4 className="font-bold text-on-surface text-base leading-tight line-clamp-2 min-h-[2.5rem]">
            {item.title || "Untitled Insight"}
          </h4>
          {item.description && (
            <p className="text-xs text-on-surface-variant/70 line-clamp-2 leading-relaxed font-medium">
              {item.description}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-outline-variant/10 flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5 max-w-[70%]">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-[9px] font-bold text-primary/60"
              >
                #{tag}
              </span>
            ))}
            {item.tags.length > 2 && (
              <span className="text-[9px] font-bold text-on-surface-variant/30">+{item.tags.length - 2}</span>
            )}
          </div>
          <p className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant/20">
            {new Date(item.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          className="absolute top-14 right-4 z-10 glass-panel rounded-2xl py-2 min-w-[140px] animate-scale-in shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === "url" && item.content && (
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-on-surface-variant hover:bg-primary-50 hover:text-primary transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
              Source
            </a>
          )}
          <button
            onClick={() => {
              deleteItem(item.id);
              setShowMenu(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 w-full transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
            Discard
          </button>
        </div>
      )}
    </div>
  );
}
