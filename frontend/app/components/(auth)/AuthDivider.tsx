"use client";

interface AuthDividerProps {
  text?: string;
}

export default function AuthDivider({ text = "o" }: AuthDividerProps) {
  return (
    <div className="flex items-center my-6">
      <div className="flex-1 h-px bg-white/10"></div>
      <span className="px-4 text-gray-400 text-sm">{text}</span>
      <div className="flex-1 h-px bg-white/10"></div>
    </div>
  );
}