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

    compiler: {
        removeConsole: true,
    },
};

export default nextConfig;