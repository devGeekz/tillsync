import type { NextConfig } from "next";

const backend = process.env.BACKEND_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // proxy API calls server-side so the browser stays same-origin and the
  // session cookie never has to be cross-site (httpOnly, SameSite=Lax)
  async rewrites() {
    return [{ source: "/api/v1/:path*", destination: `${backend}/api/v1/:path*` }];
  },
};

export default nextConfig;