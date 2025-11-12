"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #1B293A 0%, #131517 75%)" }}
    >
      <div className="w-full max-w-lg bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
        {children}
      </div>
    </div>
  );
}