"use client";

import { ButtonHTMLAttributes } from "react";
import { FileText } from "lucide-react";

interface QuizButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean;
    eventId: string;
    onQuizClick?: (eventId: string) => void;
}

export default function QuizButton({
                                       loading = false,
                                       eventId,
                                       onQuizClick,
                                       className = "",
                                       ...props
                                   }: QuizButtonProps) {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (onQuizClick) {
            onQuizClick(eventId);
        }
    };

    return (
        <button
            type="button"
            disabled={loading}
            onClick={handleClick}
            className={`px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl border border-green-500/30 flex items-center justify-center gap-2 cursor-pointer hover:from-green-700 hover:to-emerald-800 hover:rounded-3xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            {...props}
        >
            {loading ? (
                <>
          <span
              className="inline-block w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              aria-hidden="true"
          />
                    <span>Cargando...</span>
                </>
            ) : (
                <>
                    <FileText className="w-5 h-5" />
                    <span>Hacer Quiz</span>
                </>
            )}
        </button>
    );
}