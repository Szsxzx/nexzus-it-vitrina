/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Se corre como servidor Next.js normal dentro de Docker (ver
  // docker-compose.yml), no como export estatico para Netlify.
  images: {
    unoptimized: true,
  },
};
export default nextConfig;
