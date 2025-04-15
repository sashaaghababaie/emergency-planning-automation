/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/emergency-planning-automation",
  assetPrefix: "/emergency-planning-automation/",
  experimental: {
    serverActions: {
      bodySizeLimit: "20000mb",
    },
  },
};

export default nextConfig;
