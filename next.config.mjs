/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Runs as a normal Next.js app on Vercel (no more static-only export) so we
  // can have secure server routes — e.g. /api/invite-user, which uses the
  // Supabase service-role key server-side to send login invites. Every page is
  // still client-rendered (localStorage + Supabase), so nothing else changes.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
