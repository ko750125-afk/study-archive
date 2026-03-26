"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ArchiveItem } from "@/lib/types";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface StoreState {
  items: ArchiveItem[];
  isLoaded: boolean;
  isConnected: boolean;
  setItems: (items: ArchiveItem[]) => void;
  addItem: (item: Omit<ArchiveItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateItem: (id: string, updates: Partial<ArchiveItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  reorderItems: (items: ArchiveItem[]) => void;
  subscribe: () => () => void;
}

// 로컬 ID 생성
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoaded: false,
      isConnected: false,

      setItems: (items) => set({ items }),

      addItem: async (itemData) => {
        const now = Date.now();
        const newItem: ArchiveItem = {
          ...itemData,
          id: genId(),
          createdAt: now,
          updatedAt: now,
        };

        if (db) {
          try {
            const ref = await addDoc(collection(db, "archive"), {
              ...itemData,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            newItem.id = ref.id;
          } catch (err) {
            console.error("Firestore 저장 실패, 로컬 저장:", err);
          }
        }

        set((s) => ({ items: [newItem, ...s.items] }));
      },

      updateItem: async (id, updates) => {
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: Date.now() } : i
          ),
        }));

        if (db) {
          try {
            await updateDoc(doc(db, "archive", id), {
              ...updates,
              updatedAt: serverTimestamp(),
            });
          } catch (err) {
            console.error("Firestore 업데이트 실패:", err);
          }
        }
      },

      deleteItem: async (id) => {
        set((s) => ({ items: s.items.filter((i) => i.id !== id) }));

        if (db) {
          try {
            await deleteDoc(doc(db, "archive", id));
          } catch (err) {
            console.error("Firestore 삭제 실패:", err);
          }
        }
      },

      reorderItems: (items) => set({ items }),

      subscribe: () => {
        if (!db) {
          set({ isLoaded: true, isConnected: false });
          return () => {};
        }

        const q = query(collection(db, "archive"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(
          q,
          (snap) => {
            const items: ArchiveItem[] = snap.docs.map((d) => {
              const data = d.data();
              const toMs = (v: unknown) =>
                v instanceof Timestamp ? v.toMillis() : (v as number) || Date.now();
              return {
                id: d.id,
                type: data.type || "text",
                title: data.title || "",
                content: data.content || "",
                thumbnail: data.thumbnail,
                description: data.description,
                tags: data.tags || [],
                subItems: data.subItems || [],
                createdAt: toMs(data.createdAt),
                updatedAt: toMs(data.updatedAt),
              };
            });
            set({ items, isLoaded: true, isConnected: true });
          },
          (err) => {
            console.error("Firestore 구독 실패:", err);
            set({ isLoaded: true, isConnected: false });
          }
        );

        return unsub;
      },
    }),
    {
      name: "study-archive-local",
      partialize: (s) => ({ items: s.items }),
    }
  )
);
