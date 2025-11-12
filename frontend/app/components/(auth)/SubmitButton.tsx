"use client";

import { ButtonHTMLAttributes } from "react";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export default function SubmitButton({
  loading = false,
  loadingText = "Cargando...",
  children,
  className = "",
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className={`w-full py-3 mb-2 bg-black/80 text-white rounded-2xl border border-white/10 flex items-center justify-center gap-3 cursor-pointer hover:bg-black/40 hover:rounded-3xl duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
            aria-hidden="true"
          />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}