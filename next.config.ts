import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            {
                protocol: "https",
                hostname: "oymaipqpklbnvehyjbzi.supabase.co",
            },
        ],
    },
};

export default nextConfig;
