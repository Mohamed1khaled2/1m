import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // صور المعاينة بتقرا الفونت من الديسك وقت التشغيل
  outputFileTracingIncludes: {
    "/opengraph-image": ["src/assets/fonts/*.ttf"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
