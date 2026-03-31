"use client";

import { AddItemModal } from "@/components/AddItemModal";
import { useRouter } from "next/navigation";

export default function AddPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <AddItemModal onClose={() => router.push("/")} />
    </div>
  );
}
