"use client";

import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export default function InputField({ label, id, error, className = "", ...props }: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-white text-base mb-2 block">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}