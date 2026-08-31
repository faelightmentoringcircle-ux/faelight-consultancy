/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static export → produces an `out/` folder you can drag-and-drop
  // onto Netlify (no server, no build settings needed). The whole app is
  // client-side (localStorage), so this works perfectly.
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
