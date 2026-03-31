"use client";

import { ArchiveItem } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useState, useRef, useEffect } from "react";

interface ItemCardProps {
  item: ArchiveItem;
  onOpen: (item: ArchiveItem) => void;
}

export function ItemCard({ item, onOpen }: ItemCardProps) {
  const deleteItem = useStore((s) => s.deleteItem);
  const updateItem = useStore((s) => s.updateItem);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(item.title);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("정말로 이 지식을 삭제하시겠습니까?")) {
      deleteItem(item.id);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTitleSubmit = async () => {
    if (tempTitle !== item.title) {
      await updateItem(item.id, { title: tempTitle });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTitleSubmit();
    } else if (e.key === "Escape") {
      setTempTitle(item.title);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div
      onClick={() => onOpen(item)}
      className="group relative flex flex-col h-full bg-white rounded-[2.5rem] p-7 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:-translate-y-1 border border-outline-variant/30 hover:border-primary/20 cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Delete Button (Hover) */}
      <button
        onClick={handleDelete}
        className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md text-red-500 rounded-2xl shadow-lg border border-red-50 flex items-center justify-center transition-all z-20 hover:bg-red-50 hover:scale-110 active:scale-90"
      >
        <span className="material-symbols-outlined text-[20px]">delete</span>
      </button>

      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top Header: Type Icon & Date */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${typeColors[item.type] || "text-on-surface-variant bg-surface-container-highest"}`}>
          <span className="material-symbols-outlined text-[26px] material-symbols-filled">
            {typeIcons[item.type] || "article"}
          </span>
        </div>
        
        <div className="text-right group-hover:opacity-0 transition-opacity duration-300">
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
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="w-full text-xl font-black text-primary bg-primary/5 border-b-2 border-primary outline-none py-1 px-2 rounded-lg transition-all"
          />
        ) : (
          <h4 
            onClick={handleTitleClick}
            className="text-xl font-black text-on-surface leading-[1.3] tracking-tight group-hover:text-primary transition-colors line-clamp-2 hover:bg-primary/5 rounded-lg px-2 -mx-2 cursor-text"
            title="클릭하여 제목 수정"
          >
            {item.title || "제목 없는 자료"}
          </h4>
        )}
        
        <p className="text-[13px] text-on-surface-variant/60 leading-relaxed line-clamp-3 font-medium">
          {item.content || "추가 설명이 없습니다."}
        </p>
      </div>

      {/* Footer: Tags & Indicators */}
      <div className="mt-8 pt-6 border-t border-outline-variant/10 flex items-center justify-between relative z-10">
        <div className="flex flex-wrap gap-1.5 max-w-[70%]">
          {/* Tags removed for minimalist UI */}
        </div>

        {/* Sub-items Indicator & Priority & Complete Indicator */}
        <div className="flex items-center gap-2">
          {/* 학습완료 버튼: 클릭 시 학습완료 상태로 전환 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateItem(item.id, {
                isCompleted: !item.isCompleted,
                // 학습완료 시 즉즐찾기 해제 (학습할자료 다에서 자동 제외)
                isPriority: item.isCompleted ? item.isPriority : false,
              });
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
              item.isCompleted
              ? "bg-emerald-50 text-emerald-500 border-emerald-200"
              : "bg-surface-container/50 text-on-surface-variant/40 border-outline-variant/10 hover:bg-emerald-50 hover:text-emerald-500 hover:border-emerald-200"
            }`}
            title={item.isCompleted ? "학습완료 취소" : "학습완료로 이동"}
          >
            <span className={`material-symbols-outlined text-[20px] ${item.isCompleted ? "material-symbols-filled" : ""}`}>
              {item.isCompleted ? "check_circle" : "check_circle"}
            </span>
          </button>

          {/* 즉즐찾기(학습할자료) 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateItem(item.id, { isPriority: !item.isPriority });
            }}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all border ${
              item.isPriority 
              ? "bg-amber-50 text-amber-500 border-amber-200" 
              : "bg-surface-container/50 text-on-surface-variant/40 border-outline-variant/10 hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200"
            }`}
            title={item.isPriority ? "우선학습 해제" : "즐겨찾기 / 학습할자료 추가"}
          >
            <span className={`material-symbols-outlined text-[20px] ${item.isPriority ? "material-symbols-filled" : ""}`}>
              {item.isPriority ? "star" : "star_outline"}
            </span>
          </button>
          
          {item.subItems && item.subItems.length > 0 && (
            <div className="flex items-center gap-1.5 text-primary bg-primary-50 px-3 py-1.5 rounded-xl ring-1 ring-primary/10">
              <span className="material-symbols-outlined text-[16px] material-symbols-filled">account_tree</span>
              <span className="text-[11px] font-black">{item.subItems.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Hover Indicator */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shadow-2xl shadow-primary/30">
        <span className="material-symbols-outlined text-[24px]">chevron_right</span>
      </div>
    </div>
  );
}
