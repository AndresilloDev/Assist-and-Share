import Link from "next/link";
import LogoutButton from "./components/LogoutButton";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-white">
            Bienvenido crack
          </h1>
          <LogoutButton /> 
        </div>
      </div>
    </div>
  );
}