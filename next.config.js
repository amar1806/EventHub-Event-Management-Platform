/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // In development, let ESLint show warnings without failing the build
    ignoreDuringBuilds: true,
  },
  // Enable React StrictMode for better development experience
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
    ],
  },
}

module.exports = nextConfig 