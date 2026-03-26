"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const subscribe = useStore((s) => s.subscribe);

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, [subscribe]);

  return <>{children}</>;
}
