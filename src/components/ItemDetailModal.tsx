"use client";

import { ArchiveItem } from "@/lib/types";
import { useStore } from "@/lib/store";

interface Props {
  item: ArchiveItem;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  url: "링크",
  image: "이미지",
  text: "텍스트",
  notion: "노션 자료",
};

export function ItemDetailModal({ item, onClose }: Props) {
  const deleteItem = useStore((s) => s.deleteItem);

  const isImage = item.type === "image" || (item.content.startsWith("data:image") || (item.type === "url" && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(item.content)));
  const isUrl = item.type === "url";
  const isYouTube = isUrl && (item.content.includes("youtube.com") || item.content.includes("youtu.be"));

  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match?.[1];
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div
        className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle (mobile) */}
        <div className="md:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#dbe4e7] rounded-full" />
        </div>

        {/* Content area */}
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-bold text-[#476363] bg-[#cae8e8] px-2.5 py-0.5 rounded-full">
                {typeLabels[item.type] || "자료"}
              </span>
              <h2
                className="text-xl font-bold text-[#2b3437] mt-2"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                {item.title || "(제목 없음)"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#eaeff1] text-[#586064] transition-colors shrink-0"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* YouTube embed */}
          {isYouTube && (
            <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4">
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(item.content)}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Image */}
          {isImage && !isYouTube && (
            <div className="rounded-2xl overflow-hidden mb-4 bg-[#eaeff1]">
              <img
                src={item.content}
                alt={item.title}
                className="w-full object-contain max-h-80"
              />
            </div>
          )}

          {/* Content */}
          {!isImage && !isYouTube && (
            <div className="bg-[#f8f9fa] rounded-2xl p-4 mb-4">
              <pre className="text-sm text-[#2b3437] whitespace-pre-wrap font-body leading-relaxed max-h-64 overflow-y-auto">
                {item.content}
              </pre>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm text-[#586064] mb-4 leading-relaxed">{item.description}</p>
          )}

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {item.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 bg-[#cae8e8] text-[#476363] rounded-full font-medium"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Meta */}
          <p className="text-xs text-[#abb3b7] mb-6">
            추가됨:{" "}
            {new Date(item.createdAt).toLocaleString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            {isUrl && (
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#476363] text-white rounded-xl font-semibold text-sm hover:bg-[#3c5757] transition-colors"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                원본 열기
              </a>
            )}
            <button
              onClick={() => {
                deleteItem(item.id);
                onClose();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-500 rounded-xl font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
