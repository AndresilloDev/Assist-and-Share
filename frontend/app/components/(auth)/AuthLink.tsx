"use client";

interface AuthLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export default function AuthLink({ text, linkText, href }: AuthLinkProps) {
  return (
    <p className="text-right text-sm text-gray-400 mb-4">
      {text}{" "}
      <a href={href} className="underline hover:text-gray-200 duration-300">
        {linkText}
      </a>
    </p>
  );
}