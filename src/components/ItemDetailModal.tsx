"use client";

import { ArchiveItem } from "@/lib/types";
import { useStore } from "@/lib/store";

interface Props {
  item: ArchiveItem;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  url: "Source Link",
  image: "Visual Resource",
  text: "Thought Snippet",
  notion: "Workspace Doc",
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
                <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary bg-primary/10 px-3 py-1 rounded-lg ring-1 ring-primary/20">
                  {typeLabels[item.type] || "Archive"}
                </span>
                {item.priority !== "none" && (
                  <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-3 py-1 rounded-lg ${
                    item.priority === 'high' ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/20' :
                    item.priority === 'medium' ? 'bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20'
                  }`}>
                    {item.priority}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-black text-on-surface leading-tight tracking-tight">
                {item.title || "Untitled Insight"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-surface-container text-on-surface-variant transition-all hover:rotate-90 duration-300"
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
              <div className="bg-surface-container-lowest/50 rounded-[2rem] p-8 border border-outline-variant/30 relative">
                <span className="absolute top-4 right-6 material-symbols-outlined text-on-surface-variant/20 text-[40px]">format_quote</span>
                <pre className="text-base text-on-surface whitespace-pre-wrap font-medium leading-relaxed max-h-80 overflow-y-auto relative z-10 custom-scrollbar">
                  {item.content}
                </pre>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {item.description && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-widest">Context & Notes</h4>
                <p className="text-sm font-medium text-on-surface-variant leading-relaxed">{item.description}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-outline-variant/30">
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-3 py-1.5 bg-surface-container text-primary font-bold rounded-lg border border-outline-variant/30"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="text-[10px] font-bold text-on-surface-variant/30 uppercase tracking-[0.15em] flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">history</span>
                Captured on {new Date(item.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-10">
            {isUrl && (
              <a
                href={item.content}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] flex items-center justify-center gap-3 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                Access Resource
              </a>
            )}
            <button
              onClick={() => {
                deleteItem(item.id);
                onClose();
              }}
              className="flex-1 flex items-center justify-center gap-3 py-4 border-2 border-red-100 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">delete</span>
              Discard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
