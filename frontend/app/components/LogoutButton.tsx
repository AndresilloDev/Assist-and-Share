"use client";

import { useAuth } from "@/hooks/useAuth";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Cerrar sesión
    </button>
  );
}
