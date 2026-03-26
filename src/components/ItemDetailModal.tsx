"use client";

import { ArchiveItem } from "@/lib/types";
import { useStore } from "@/lib/store";

interface Props {
  item: ArchiveItem;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  url: "웹 리소스",
  image: "이미지 자료",
  text: "메모/생각",
  notion: "문서 도구",
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
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 transition-all duration-500"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-surface/40 backdrop-blur-xl animate-fade-in" />

      <div
        className="relative w-full md:max-w-2xl glass-panel bg-white/80 rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in border border-white/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="md:hidden flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-on-surface/10 rounded-full" />
        </div>

        <div className="p-8 md:p-10">
          <div className="flex items-start justify-between gap-6 mb-8">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary bg-primary-10/40 backdrop-blur-md px-3 py-1 rounded-lg ring-1 ring-primary/20">
                  {typeLabels[item.type] || "보관 자료"}
                </span>
              </div>
              <h2 className="text-3xl font-black text-on-surface leading-tight tracking-tight">
                {item.title || "제목 없는 자료"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all hover:rotate-90 duration-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>
          </div>

          <div className="space-y-6 mb-10">
            {isYouTube && (
              <div className="aspect-video rounded-[2rem] overflow-hidden bg-black shadow-2xl ring-1 ring-white/20">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(item.content)}`}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {isImage && !isYouTube && (
              <div className="rounded-[2.5rem] overflow-hidden bg-surface-container-low shadow-xl ring-1 ring-white/50 group relative">
                <img
                  src={item.content}
                  alt={item.title}
                  className="w-full object-contain max-h-[400px] transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            {!isImage && !isYouTube && (
              <div className="bg-surface-container-lowest/50 rounded-[2.5rem] p-8 border border-outline-variant/30 relative">
                <span className="absolute top-4 right-6 material-symbols-outlined text-on-surface-variant/20 text-[60px] opacity-10">format_quote</span>
                <pre className="text-base text-on-surface whitespace-pre-wrap font-medium leading-relaxed max-h-80 overflow-y-auto relative z-10 custom-scrollbar">
                  {item.content || "내용이 없습니다."}
                </pre>
              </div>
            )}

            {item.subItems && item.subItems.length > 0 && (
              <div className="space-y-5 pt-6 border-t border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[18px]">account_tree</span>
                  <h4 className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-widest">연관 리소스</h4>
                </div>
                <div className="grid gap-3">
                  {item.subItems.map((sub) => (
                    <div key={sub.id} className="group relative">
                      {sub.type === "url" ? (
                        <a
                          href={sub.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-5 bg-surface-container-low/50 hover:bg-primary/5 rounded-3xl border border-outline-variant/20 hover:border-primary/30 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <span className="material-symbols-outlined text-[20px]">link</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-on-surface tracking-tight leading-tight">{sub.title}</span>
                              <span className="text-[11px] text-on-surface-variant/50 truncate max-w-[280px] mt-1">{sub.content}</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-[20px] text-primary/30 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                      ) : (
                        <div className="p-5 bg-surface-container-low/30 rounded-3xl border border-outline-variant/20">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant/60">
                              <span className="material-symbols-outlined text-[20px]">notes</span>
                            </div>
                            <span className="text-sm font-bold text-on-surface tracking-tight">{sub.title}</span>
                          </div>
                          <p className="text-sm text-on-surface-variant/70 font-medium leading-relaxed italic ml-14">"{sub.content}"</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {item.description && (
              <div className="space-y-3 p-6 rounded-3xl bg-secondary-10/10 border border-secondary-500/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px]">sticky_note</span>
                  <h4 className="text-[11px] font-black text-secondary/60 uppercase tracking-widest">생각 및 노트</h4>
                </div>
                <p className="text-[15px] font-medium text-on-surface-variant/80 leading-relaxed italic">{item.description}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-6 pt-8 border-t border-outline-variant/20">
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-3.5 py-1.5 bg-surface-container-high text-primary/70 font-black rounded-lg border border-outline-variant/10 uppercase tracking-wider"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">history</span>
                {new Date(item.createdAt).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} 기록됨
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-12 pb-2">
            {isUrl && (
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] flex items-center justify-center gap-3 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-primary-600 active:scale-95 transition-all shadow-2xl shadow-primary/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12" />
                <span className="material-symbols-outlined text-[20px] group-hover:rotate-12 transition-transform">open_in_new</span>
                원본 소스 보기
              </a>
            )}
            <button
              onClick={() => {
                if (confirm("정말로 이 지식을 삭제하시겠습니까?")) {
                  deleteItem(item.id);
                  onClose();
                }
              }}
              className="flex-1 flex items-center justify-center gap-3 py-5 bg-surface border-2 border-outline-variant/30 text-on-surface-variant/40 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-red-50 hover:text-red-500 hover:border-red-100 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">delete_outline</span>
              삭제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
