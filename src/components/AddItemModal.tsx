"use client";

import { useState, useTransition, useRef } from "react";
import { useStore } from "@/lib/store";
import { fetchMetadata } from "@/lib/actions";
import { ItemType } from "@/lib/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

// Tag suggestions removed for minimalist UI

interface Props {
  onClose: () => void;
}

export function AddItemModal({ onClose }: Props) {
  const addItem = useStore((s) => s.addItem);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subItems, setSubItems] = useState<{ title: string; content: string }[]>([]);
  const [newSubValue, setNewSubValue] = useState("");
  const [showSubInput, setShowSubInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const isUrl = (val: string) => {
    try {
      new URL(val.trim());
      return true;
    } catch {
      return false;
    }
  };

  const detectType = (val: string): ItemType => {
    if (isUrl(val)) return "url";
    if (val.startsWith("# ") || val.includes("\n## ")) return "notion";
    return "text";
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text");
    setContent(pasted);

    if (isUrl(pasted)) {
      setIsAnalyzing(true);
      try {
        await fetchMetadata(pasted.trim());
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSave = () => {
    if (!content.trim() && subItems.length === 0) return;
    const firstContent = content.trim() || subItems[0]?.content || "";
    const type = detectType(firstContent);
    const finalTitle = title.trim() || content.slice(0, 40) || subItems[0]?.title || "New Material";
    
    startTransition(async () => {
      await addItem({
        type,
        title: finalTitle,
        content: content.trim(),
        tags: [],
        subItems: subItems.map((s, i) => ({
          id: `sub-${Date.now()}-${i}`,
          title: s.title,
          content: s.content,
          type: isUrl(s.content) ? "url" : "text",
        })),
        thumbnail: undefined,
        description: undefined,
      });
      onClose();
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-500"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-surface/40 backdrop-blur-xl animate-fade-in" />

      <div
        className="relative w-full md:max-w-2xl glass-panel bg-white/80 rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto border border-white/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-on-surface/10 rounded-full" />
        </div>

        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-primary tracking-tight">
                자료 보관하기
              </h2>
              <p className="text-xs font-bold text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">간편 저장소</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all hover:rotate-90 duration-300"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div className="mb-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="제목 (선택사항)"
              className="w-full px-6 py-4 bg-surface-container-low/50 rounded-2xl text-sm font-bold text-on-surface border border-outline-variant/20 focus:border-primary/40 focus:ring-4 focus:ring-primary/5 outline-none transition-all mb-4"
            />
            <div
              className="relative rounded-[2rem] border-2 border-outline-variant/30 bg-surface-container-lowest focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5 transition-all duration-500 overflow-hidden"
            >
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onPaste={handlePaste}
                placeholder="Paste a link, image URL, or notes here..."
                className="w-full h-44 p-6 bg-transparent resize-none outline-none text-on-surface placeholder:text-on-surface-variant/30 text-base font-medium leading-relaxed"
              />
              
              {isAnalyzing && (
                <div className="absolute inset-x-0 bottom-0 py-3 px-6 bg-primary/10 backdrop-blur-md flex items-center gap-3 text-xs font-bold text-primary animate-slide-up">
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                  Refining metadata...
                </div>
              )}
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-widest">Related Resources</h4>
              <button
                onClick={() => setShowSubInput(!showSubInput)}
                className="text-base font-black text-white bg-primary px-8 py-4 rounded-2xl hover:bg-primary-600 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px]">{showSubInput ? "close" : "add"}</span>
                {showSubInput ? "취소" : "리소스 추가"}
              </button>
            </div>

            {showSubInput && (
              <div className="bg-surface-container-low/30 rounded-2xl p-4 mb-4 border border-primary/20 animate-fade-in">
                <div className="flex gap-2">
                  <input
                    value={newSubValue}
                    onChange={(e) => setNewSubValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newSubValue.trim()) {
                        const val = newSubValue.trim();
                        setSubItems([...subItems, { title: isUrl(val) ? "Link" : "Note", content: val }]);
                        setNewSubValue("");
                        setShowSubInput(false);
                      }
                    }}
                    placeholder="URL 또는 메모를 입력하세요..."
                    className="flex-1 px-5 py-3 bg-white rounded-xl text-sm font-medium outline-none border border-outline-variant/30 focus:border-primary/50 shadow-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newSubValue.trim()) {
                        const val = newSubValue.trim();
                        setSubItems([...subItems, { title: isUrl(val) ? "Link" : "Note", content: val }]);
                        setNewSubValue("");
                        setShowSubInput(false);
                      }
                    }}
                    className="px-6 bg-primary text-white rounded-xl text-sm font-black uppercase shadow-lg shadow-primary/20 active:scale-95 transition-all"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {subItems.map((sub, idx) => (
                <div key={idx} className="flex items-center justify-between bg-surface-container-highest/30 px-4 py-3 rounded-xl border border-outline-variant/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-primary uppercase">{sub.title}</span>
                    <span className="text-[11px] font-medium text-on-surface-variant truncate max-w-[200px]">{sub.content}</span>
                  </div>
                  <button
                    onClick={() => setSubItems(subItems.filter((_, i) => i !== idx))}
                    className="text-on-surface-variant/40 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending || !content.trim()}
            className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-primary/40 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
            
            {isPending ? (
              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                자료 저장하기
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">bolt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
