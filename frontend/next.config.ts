import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    redirects: () => {
        return [
            {
                source: "/",
                destination: "/events",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
