"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { AxiosError } from "axios";
import AuthLayout from "../../components/(auth)/AuthLayout";
import AuthCard from "../../components/(auth)/AuthCard";
import AlertMessage from "../../components/(auth)/AlertMessage";
import InputField from "../../components/(auth)/InputField";
import SubmitButton from "../../components/(auth)/SubmitButton";
import AuthLink from "../../components/(auth)/AuthLink";
import BackButton from "../../components/(auth)/BackButton";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data } = await api.post("/auth/forgot-password", { email });

      if (data.success) {
        setSuccess(true);
        setEmail("");
      }
    } catch (err) {
      const message = err instanceof AxiosError 
        ? err.response?.data?.message || "Error del servidor"
        : err instanceof Error 
        ? err.message 
        : "Error al enviar el correo";
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <BackButton />

      <AuthCard title="Recuperar contraseña" subtitle="Recibiras las instrucciones en tu correo electrónico">
        {success && (
          <AlertMessage
            type="success"
            title="Correo enviado exitosamente"
            message="Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña."
          />
        )}

        {error && <AlertMessage type="error" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="email"
            type="email"
            label="Correo electrónico"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
          />

          <SubmitButton loading={loading} loadingText="Enviando...">
            Enviar enlace de recuperación
          </SubmitButton>
        </form>

        <AuthLink
          text="¿Recordaste tu contraseña?"
          linkText="Iniciar sesión"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Cargando…
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}