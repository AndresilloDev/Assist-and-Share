"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  to?: string;
  label?: string;
}

export default function BackButton({ to = "/login", label = "Volver" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(to)}
      className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-6 cursor-pointer"
    >
      <ArrowLeft size={20} />
      <span>{label}</span>
    </button>
  );
}