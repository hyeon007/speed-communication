import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Device images are small local files; serving them as-is avoids needing a paid
    // image-resizing service on Cloudflare.
    unoptimized: true,
  },
};

export default nextConfig;

// Lets `next dev` read Cloudflare bindings and .dev.vars.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
