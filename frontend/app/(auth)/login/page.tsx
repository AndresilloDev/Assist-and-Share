"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../lib/api";
import { AxiosError } from "axios";
import AuthLayout from "../../components/(auth)/AuthLayout";
import AuthCard from "../../components/(auth)/AuthCard";
import AlertMessage from "../../components/(auth)/AlertMessage";
import InputField from "../../components/(auth)/InputField";
import PasswordInput from "../../components/(auth)/PasswordInput";
import SubmitButton from "../../components/(auth)/SubmitButton";
import AuthDivider from "../../components/(auth)/AuthDivider";
import GoogleButton from "../../components/(auth)/GoogleButton";
import AuthLink from "../../components/(auth)/AuthLink";

const ERROR_MESSAGES: Record<string, string> = {
  no_token: "No se recibió el token",
  callback_failed: "Error al autenticar con Google",
  session_expired: "Los datos son inválidos",
  authentication_failed: "Falló la autenticación",
};

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, checkAuth } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated) router.push("/events");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) {
      setError(ERROR_MESSAGES[urlError] || "Error de autenticación");
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { email, password });

      if (!data.success || !data.value?.token) {
        throw new Error("No se recibió el token de autenticación");
      }

      document.cookie = `auth-token=${data.value.token}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
      
      await checkAuth();
      
      setTimeout(() => router.push("/events"), 100);
    } catch (err) {
      const message = err instanceof AxiosError 
        ? err.response?.data?.message || "Error del servidor"
        : err instanceof Error 
        ? err.message 
        : "Error al iniciar sesión";
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <AuthLayout>
      <AuthCard title="Iniciar Sesión" subtitle="Accede a tu espacio personal">
        {error && <AlertMessage type="error" message={error} />}

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <InputField
            id="email"
            type="email"
            label="Correo electrónico"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />

          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            placeholder="C0n7r4s3ñ4"
          />

          <AuthLink
            text="¿Olvidaste tu contraseña?"
            linkText="Recupérala"
            href="/forgot-password"
          />

          <SubmitButton loading={loading} loadingText="Iniciando sesión...">
            Iniciar sesión
          </SubmitButton>
        </form>

        <AuthDivider />

        <GoogleButton onClick={handleGoogleLogin} />

        <AuthLink
          text="¿No tienes cuenta?"
          linkText="Regístrate"
          href="/signup"
        />
      </AuthCard>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}