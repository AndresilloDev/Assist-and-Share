"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
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

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        role: "attendee",
      });
      router.push("/login");
    } catch (err) {
      let msg = "Error al registrarse.";

      if (err instanceof AxiosError) {
        msg = err.response?.data?.message || "Error del servidor";
      } else if ((err as any).request) {
        msg = "No hay conexión";
      } else if ((err as any).message) {
        msg = (err as any).message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <AuthLayout>
      <AuthCard title="Registrarse" subtitle="Inicia hoy creando una nueva cuenta">
        <form onSubmit={handleRegister} className="space-y-4">
          <InputField
            id="firstName"
            type="text"
            label="Nombre"
            value={firstName}
            required
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Pedro"
          />

          <InputField
            id="lastName"
            type="text"
            label="Apellidos"
            value={lastName}
            required
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Juárez"
          />

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

          <SubmitButton loading={loading} loadingText="Registrando…">
            Crear cuenta
          </SubmitButton>
        </form>

        <AuthDivider />

        <GoogleButton onClick={handleGoogleLogin} />

        {error && <AlertMessage type="error" message={error} />}

        <AuthLink
          text="¿Ya tienes cuenta?"
          linkText="Inicia sesión"
          href="/login"
        />
      </AuthCard>
    </AuthLayout>
  );
}

export default function RegisterPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          Cargando…
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}