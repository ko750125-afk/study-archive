"use client";

import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const items = useStore((s) => s.items);

  return (
    <div className="min-h-screen bg-surface p-6 md:p-10 max-w-4xl mx-auto space-y-12 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-primary tracking-tight">설정</h1>
        <p className="text-on-surface-variant font-medium opacity-60">애플리케이션 환경을 설정합니다.</p>
      </header>

      <div className="space-y-8">
        <section className="p-8 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">계정 정보</h3>
              <p className="text-xs text-on-surface-variant/60">현재 로그인된 사용자 정보입니다.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-outline-variant/10">
            <p className="text-sm font-bold text-on-surface">Anonymous User</p>
            <p className="text-xs text-on-surface-variant/40 italic">로컬 브라우저 세션 사용 중</p>
          </div>
        </section>

        <section className="p-8 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary-50 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">데이터 관리</h3>
              <p className="text-xs text-on-surface-variant/60">저장된 데이터 현황 및 백업 설정입니다.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-outline-variant/10 text-center space-y-2">
              <p className="text-[10px] font-black uppercase text-on-surface-variant/40">저장된 항목</p>
              <p className="text-3xl font-black text-primary">{items.length}</p>
            </div>
            <div className="p-6 rounded-3xl bg-white border border-outline-variant/10 text-center space-y-2">
              <p className="text-[10px] font-black uppercase text-on-surface-variant/40">백업 상태</p>
              <p className="text-sm font-bold text-emerald-500 uppercase">최신 상태</p>
            </div>
          </div>
          <button className="w-full py-4 bg-surface text-on-surface-variant font-bold rounded-2xl border border-outline-variant/30 hover:bg-surface-container-high transition-all">
            데이터 내보내기 (.json)
          </button>
        </section>

        <section className="p-8 rounded-[2.5rem] bg-surface-container-low border border-outline-variant/30 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-tertiary-50 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">palette</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">디스플레이</h3>
              <p className="text-xs text-on-surface-variant/60">테마 및 언어 설정을 변경합니다.</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-outline-variant/10">
              <span className="text-sm font-bold text-on-surface">언어 (Language)</span>
              <span className="text-xs font-black text-primary bg-primary-50 px-3 py-1 rounded-full">KOREAN</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-outline-variant/10 opacity-50">
              <span className="text-sm font-bold text-on-surface">다크 모드</span>
              <span className="text-[10px] font-black text-on-surface-variant">시스템 설정</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
