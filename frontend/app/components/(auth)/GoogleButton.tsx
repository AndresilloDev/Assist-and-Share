"use client";

interface GoogleButtonProps {
  onClick: () => void;
}

export default function GoogleButton({ onClick }: GoogleButtonProps) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="w-full py-3 bg-white text-gray-800 rounded-2xl flex items-center justify-center gap-3 mb-4 hover:bg-gray-200 hover:rounded-3xl duration-300 cursor-pointer"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt="Google"
        className="w-5 h-5"
      />
      Continuar con Google
    </button>
  );
}