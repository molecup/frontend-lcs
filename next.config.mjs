/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'django-backend-lcs-storage.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
