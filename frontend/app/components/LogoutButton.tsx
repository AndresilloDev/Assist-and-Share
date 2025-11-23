"use client";

import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout} className="py-1 px-5 underline text-gray-300 rounded-lg text-xs hover:cursor-pointer">
      Cerrar sesión
    </button>
  );
}
