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

interface Props {
  item: ArchiveItem;
  onOpen: (item: ArchiveItem) => void;
}

export function ItemCard({ item, onOpen }: Props) {
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
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#cae8e8] cursor-pointer animate-fade-in overflow-hidden"
      onClick={() => onOpen(item)}
    >
      {/* Thumbnail */}
      {item.thumbnail && (
        <div className="h-36 overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              item.type === "url"
                ? "bg-[#cae8e8] text-[#476363]"
                : item.type === "image"
                ? "bg-[#d6e7d7] text-[#546356]"
                : item.type === "notion"
                ? "bg-[#eaeff1] text-[#586064]"
                : "bg-[#fd8a42]/15 text-[#9d4500]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateItem(item.id, {
                  priority: cycledPriority[item.priority],
                });
              }}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide transition-colors ${
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
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#eaeff1] text-[#737c7f] transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">more_vert</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="font-semibold text-[#2b3437] leading-snug mb-1 line-clamp-2" style={{ fontFamily: "Manrope, sans-serif" }}>
          {item.title || "(제목 없음)"}
        </h4>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-[#586064] line-clamp-2 mb-3">{item.description}</p>
        )}

        {/* Tags */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 bg-[#eaeff1] text-[#586064] rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <p className="text-[11px] text-[#abb3b7]">
          {new Date(item.createdAt).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <div
          className="absolute top-12 right-3 z-10 bg-white rounded-xl shadow-xl border border-[#eaeff1] py-1 min-w-[120px] animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === "url" && item.content && (
            <a
              href={item.content}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-[#586064] hover:bg-[#eaeff1]"
              onClick={() => setShowMenu(false)}
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              열기
            </a>
          )}
          <button
            onClick={() => {
              deleteItem(item.id);
              setShowMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
