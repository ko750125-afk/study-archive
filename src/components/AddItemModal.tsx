"use client";

import { useState, useTransition, useRef } from "react";
import { useStore } from "@/lib/store";
import { fetchMetadata } from "@/lib/actions";
import { ItemType, Priority } from "@/lib/types";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "@/lib/firebase";

const TAG_SUGGESTIONS = ["디자인", "개발", "기획", "마케팅", "AI", "비즈니스", "학습", "영상", "아티클"];

interface Props {
  onClose: () => void;
}

export function AddItemModal({ onClose }: Props) {
  const addItem = useStore((s) => s.addItem);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [priority, setPriority] = useState<Priority>("none");
  const [isPending, startTransition] = useTransition();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        const meta = await fetchMetadata(pasted.trim());
        if (meta) {
          if (!title) setTitle(meta.title || "");
        }
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!app) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setContent(url);
        if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
      };
      reader.readAsDataURL(file);
      return;
    }
    setIsAnalyzing(true);
    try {
      const storage = getStorage(app);
      const storageRef = ref(storage, `images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setContent(url);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    } catch {
      const reader = new FileReader();
      reader.onload = (e) => {
        setContent(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleImageUpload(file);
  };

  const addTag = (tag: string) => {
    const cleaned = tag.trim().replace(/^#/, "");
    if (cleaned && !tags.includes(cleaned)) setTags([...tags, cleaned]);
    setTagInput("");
  };

  const handleSave = () => {
    if (!content.trim() && !title.trim()) return;
    const type = detectType(content);
    startTransition(async () => {
      await addItem({
        type,
        title: title || content.slice(0, 60),
        content: content.trim(),
        tags,
        priority,
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
                Capture Insight
              </h2>
              <p className="text-xs font-bold text-on-surface-variant opacity-50 uppercase tracking-widest mt-1">New Archive Entry</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all hover:rotate-90 duration-300"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div
            className={`relative mb-6 rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
              dragOver
                ? "border-primary bg-primary/5 ring-8 ring-primary/5"
                : "border-outline-variant/30 bg-surface-container-lowest focus-within:border-primary/40 focus-within:ring-8 focus-within:ring-primary/5"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="Paste a link, image URL, or drop files here..."
              className="w-full h-44 p-6 bg-transparent resize-none outline-none text-on-surface placeholder:text-on-surface-variant/30 text-base font-medium leading-relaxed"
            />
            
            {isAnalyzing && (
              <div className="absolute inset-x-0 bottom-0 py-3 px-6 bg-primary/10 backdrop-blur-md flex items-center gap-3 text-xs font-bold text-primary animate-slide-up">
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                Refining metadata...
              </div>
            )}

            <div className="flex items-center justify-between px-6 pb-4">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary hover:text-primary-600 transition-colors bg-primary/5 px-4 py-2 rounded-xl"
              >
                <span className="material-symbols-outlined text-[18px]">image</span>
                Pick Image
              </button>
              <div className="flex items-center gap-2 opacity-30">
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {dragOver ? "READY TO DROP" : "SMART DETECTION ACTIVE"}
                </span>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </div>

          <div className="relative mb-6 group">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
              title
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a descriptive title..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/30 text-sm font-bold text-on-surface placeholder:text-on-surface-variant/30 outline-none focus:bg-white focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all"
            />
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 text-xs px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold ring-1 ring-primary/20"
                >
                  #{t}
                  <button 
                    onClick={() => setTags(tags.filter((x) => x !== t))}
                    className="hover:scale-125 transition-transform"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              <div className="relative flex-grow min-w-[140px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[16px] material-symbols-outlined">tag</span>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagInput);
                    }
                  }}
                  placeholder="New tag..."
                  className="w-full text-xs pl-9 pr-4 py-2.5 bg-surface-container-highest/50 rounded-xl outline-none text-on-surface font-bold placeholder:text-on-surface-variant/30 focus:bg-white transition-all border border-transparent focus:border-primary/20"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).map((t) => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  className="text-[10px] px-3 py-1.5 bg-surface-container-lowest border border-outline-variant/20 text-on-surface-variant font-bold rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all uppercase tracking-wider"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mb-10">
            {(["high", "medium", "low", "none"] as Priority[]).map((p) => {
              const labels = { high: "URGENT", medium: "NORMAL", low: "LATER", none: "NONE" };
              const colors = { 
                high: "bg-red-500", 
                medium: "bg-amber-500", 
                low: "bg-emerald-500", 
                none: "bg-on-surface-variant" 
              };
              const isActive = priority === p;
              
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`relative py-4 rounded-2xl text-[10px] font-black tracking-[0.1em] transition-all overflow-hidden ${
                    isActive
                      ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105 z-10"
                      : "bg-surface-container-high text-on-surface-variant/60 hover:bg-surface-container-highest"
                  }`}
                >
                  <div className={`absolute top-0 left-0 w-1 h-full ${colors[p]} opacity-50`} />
                  {labels[p]}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={isPending || (!content.trim() && !title.trim())}
            className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary-600 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-2xl shadow-primary/40 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
            
            {isPending ? (
              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Confirm Capture
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">bolt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
