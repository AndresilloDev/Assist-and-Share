"use client";

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl text-white">{title}</h1>
        <p className="text-gray-400 text-base">{subtitle}</p>
      </div>
      {children}
    </>
  );
}