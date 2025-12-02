import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export async function redirects() {
    return [
        {
            source: "/",
            destination: "/events",
            permanent: true,
        },
    ];
}

export default nextConfig;