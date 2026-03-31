"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
} from "firebase/firestore";

export default function SettingsPage() {
  const items = useStore((s) => s.items);
  const isConnected = useStore((s) => s.isConnected);

  // 동기화 상태 관리
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "checking" | "syncing" | "done" | "error"
  >("idle");
  const [syncResult, setSyncResult] = useState<{
    uploaded: number;
    skipped: number;
    total: number;
  } | null>(null);

  // JSON 내보내기 (기존 기능 실제 구현)
  const handleExport = () => {
    const json = JSON.stringify(items, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `study-archive-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /**
   * 핵심 기능: 로컬 데이터를 Firestore로 강제 동기화
   * - Firestore에 이미 존재하는 항목은 건너뜀 (중복 방지)
   * - Firestore에 없는 항목만 업로드
   */
  const handleSyncToCloud = async () => {
    if (!db) {
      alert("Firebase 연결이 없습니다. 설정을 확인해주세요.");
      return;
    }
    if (items.length === 0) {
      alert("동기화할 자료가 없습니다.");
      return;
    }

    setSyncStatus("checking");
    setSyncResult(null);

    try {
      // 1단계: Firestore에 현재 있는 모든 문서 ID 수집
      const q = query(collection(db, "archive"));
      const snap = await getDocs(q);
      const existingIds = new Set(snap.docs.map((d) => d.id));

      // 2단계: 로컬에만 있는 항목 필터링 (Firestore에 없는 것만)
      const localOnlyItems = items.filter((item) => !existingIds.has(item.id));

      setSyncStatus("syncing");

      let uploaded = 0;
      const skipped = items.length - localOnlyItems.length;

      // 3단계: 로컬 전용 항목들을 Firestore에 업로드
      for (const item of localOnlyItems) {
        try {
          await addDoc(collection(db, "archive"), {
            type: item.type,
            title: item.title,
            content: item.content,
            thumbnail: item.thumbnail || "",
            description: item.description || "",
            tags: item.tags || [],
            subItems: item.subItems || [],
            isPriority: item.isPriority || false,
            isCompleted: item.isCompleted || false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          uploaded++;
        } catch (err) {
          console.error("항목 업로드 실패:", item.title, err);
        }
      }

      setSyncStatus("done");
      setSyncResult({ uploaded, skipped, total: items.length });
    } catch (err) {
      console.error("동기화 실패:", err);
      setSyncStatus("error");
    }
  };

  const syncStatusMessages: Record<string, string> = {
    idle: "",
    checking: "Firestore 현황 확인 중...",
    syncing: "클라우드로 업로드 중...",
    done: "동기화 완료!",
    error: "동기화 중 오류가 발생했습니다.",
  };

  return (
    <div className="min-h-screen bg-surface p-6 md:p-10 max-w-4xl mx-auto space-y-12 animate-fade-in">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-primary tracking-tight">설정</h1>
        <p className="text-on-surface-variant font-medium opacity-60">
          애플리케이션 환경을 설정합니다.
        </p>
      </header>

      <div className="space-y-8">
        {/* 계정 정보 */}
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
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-amber-400"}`}
              />
              <p className="text-xs text-on-surface-variant/50">
                {isConnected ? "Firebase 실시간 연결 중" : "로컬 브라우저 세션 사용 중"}
              </p>
            </div>
          </div>
        </section>

        {/* ───── 클라우드 동기화 (핵심 신규 기능) ───── */}
        <section className="p-8 rounded-[2.5rem] bg-surface-container-low border-2 border-primary/20 space-y-6 relative overflow-hidden">
          {/* 강조 배경 */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[24px]">cloud_sync</span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">클라우드 동기화</h3>
              <p className="text-xs text-on-surface-variant/60">
                이 기기의 자료를 Firebase에 업로드하여 모든 기기에서 볼 수 있게 합니다.
              </p>
            </div>
          </div>

          {/* 설명 배너 */}
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-sm text-primary/80 font-medium leading-relaxed relative z-10">
            <p className="flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">info</span>
              <span>
                이 기기(브라우저)에 저장된 자료 중 <strong>클라우드에 없는 항목만</strong>{" "}
                선택적으로 업로드합니다. 기존 Firebase 데이터는 변경되지 않습니다.
              </span>
            </p>
          </div>

          {/* 현황 카드 */}
          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="p-5 rounded-3xl bg-white border border-outline-variant/10 text-center space-y-1">
              <p className="text-[10px] font-black uppercase text-on-surface-variant/40">
                이 기기 자료
              </p>
              <p className="text-3xl font-black text-primary">{items.length}</p>
            </div>
            <div className="p-5 rounded-3xl bg-white border border-outline-variant/10 text-center space-y-1">
              <p className="text-[10px] font-black uppercase text-on-surface-variant/40">
                연결 상태
              </p>
              <p
                className={`text-sm font-black uppercase ${
                  isConnected ? "text-emerald-500" : "text-amber-500"
                }`}
              >
                {isConnected ? "연결됨 ✓" : "오프라인"}
              </p>
            </div>
          </div>

          {/* 동기화 결과 표시 */}
          {syncStatus === "done" && syncResult && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-1 relative z-10 animate-fade-in">
              <p className="text-sm font-black text-emerald-700">✅ 동기화 완료!</p>
              <p className="text-xs text-emerald-600">
                · 새로 업로드: <strong>{syncResult.uploaded}개</strong>
              </p>
              <p className="text-xs text-emerald-600">
                · 이미 존재 (건너뜀): <strong>{syncResult.skipped}개</strong>
              </p>
              <p className="text-xs text-emerald-500 mt-2 font-medium">
                이제 다른 기기(모바일)에서 새로고침하면 모든 자료가 보입니다 🎉
              </p>
            </div>
          )}

          {syncStatus === "error" && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 relative z-10 animate-fade-in">
              <p className="text-sm font-black text-red-600">
                ❌ 동기화 실패 - Firebase 연결을 확인해주세요.
              </p>
            </div>
          )}

          {/* 동기화 버튼 */}
          <button
            onClick={handleSyncToCloud}
            disabled={
              syncStatus === "checking" ||
              syncStatus === "syncing" ||
              !isConnected
            }
            className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-primary-dim active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 relative overflow-hidden group z-10"
          >
            <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-700 skew-x-12" />
            {syncStatus === "checking" || syncStatus === "syncing" ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {syncStatusMessages[syncStatus]}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                이 기기 자료를 클라우드에 업로드
              </>
            )}
          </button>

          {!isConnected && (
            <p className="text-xs text-center text-amber-600 font-medium -mt-2 relative z-10">
              ⚠ Firebase 연결이 필요합니다. 잠시 후 다시 시도해주세요.
            </p>
          )}
        </section>

        {/* 데이터 관리 */}
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
              <p className={`text-sm font-bold uppercase ${isConnected ? "text-emerald-500" : "text-amber-500"}`}>
                {isConnected ? "최신 상태" : "로컬 전용"}
              </p>
            </div>
          </div>
          {/* JSON 내보내기 (이제 실제 작동) */}
          <button
            onClick={handleExport}
            className="w-full py-4 bg-surface text-on-surface-variant font-bold rounded-2xl border border-outline-variant/30 hover:bg-surface-container-high transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            데이터 내보내기 (.json)
          </button>
        </section>

        {/* 디스플레이 */}
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
