/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // For Heroku, the standard build output is usually fine.
  // If you encounter issues with slug size or need a more optimized deployment,
  // you might consider `output: 'standalone'`, but it requires adjusting
  // your Procfile and how Heroku serves the app.
  // output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
