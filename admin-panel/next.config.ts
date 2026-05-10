import type { NextConfig } from "next";
const nextConfig: NextConfig = { images: { remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }, { protocol: "https", hostname: "*.amazonaws.com" }, { protocol: "http", hostname: "localhost" }, { protocol: "http", hostname: "backend" }, { protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "ui-avatars.com" }] } };
export default nextConfig;
