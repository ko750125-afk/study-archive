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
      // fallback: use data URL
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
      // fallback
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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#dbe4e7] rounded-full" />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#2b3437]" style={{ fontFamily: "Manrope, sans-serif" }}>
              자료 추가
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#eaeff1] text-[#586064] transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Drop zone / Textarea */}
          <div
            className={`relative mb-4 rounded-2xl border-2 transition-colors ${
              dragOver
                ? "border-[#476363] bg-[#cae8e8]/20"
                : "border-[#eaeff1] bg-[#f8f9fa]"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={handlePaste}
              placeholder="링크, 텍스트, Notion 내용을 붙여넣거나 이미지를 드래그하세요..."
              className="w-full h-40 p-4 bg-transparent resize-none outline-none text-[#2b3437] placeholder:text-[#abb3b7] text-sm"
            />
            {isAnalyzing && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-[#476363]">
                <div className="w-3 h-3 border-2 border-[#476363] border-t-transparent rounded-full animate-spin" />
                분석 중...
              </div>
            )}
            <div className="flex items-center justify-between px-4 pb-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1.5 text-xs text-[#586064] hover:text-[#476363] transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">image</span>
                이미지 업로드
              </button>
              <span className="text-xs text-[#abb3b7]">
                {dragOver ? "여기에 놓으세요" : "드래그하여 이미지 추가"}
              </span>
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

          {/* Title */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목 (선택사항 — URL이면 자동으로 가져옵니다)"
            className="w-full px-4 py-3 rounded-xl bg-[#f8f9fa] border border-[#eaeff1] text-sm text-[#2b3437] placeholder:text-[#abb3b7] outline-none focus:border-[#476363]/50 transition-colors mb-4"
          />

          {/* Tags */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-[#cae8e8] text-[#476363] rounded-full font-medium"
                >
                  #{t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="태그 입력..."
                className="text-xs px-3 py-1 bg-[#eaeff1] rounded-full outline-none text-[#586064] placeholder:text-[#abb3b7] min-w-24"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TAG_SUGGESTIONS.filter((t) => !tags.includes(t)).map((t) => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  className="text-[11px] px-2.5 py-1 border border-[#e3e9ec] text-[#586064] rounded-full hover:bg-[#eaeff1] transition-colors"
                >
                  +{t}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div className="flex gap-2 mb-6">
            {(["high", "medium", "low", "none"] as Priority[]).map((p) => {
              const labels = { high: "🔴 우선", medium: "🟡 보통", low: "🟢 나중에", none: "⚪ 없음" };
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                    priority === p
                      ? "bg-[#476363] text-white shadow-sm"
                      : "bg-[#eaeff1] text-[#586064] hover:bg-[#e3e9ec]"
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isPending || (!content.trim() && !title.trim())}
            className="w-full py-4 bg-[#476363] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#3c5757] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#476363]/20"
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {isPending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                저장하기
                <span className="material-symbols-outlined text-[18px]">send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
