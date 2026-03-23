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
  async redirects() {
    return [
      {
        source: '/molecup',
        destination: '/competitions/mole-cup',
        permanent: true,
      },
      {
        source: '/molecup/team/:teamSlug',
        destination: '/competitions/mole-cup/squadre/:teamSlug',
        permanent: true,
      },
      {
        source: '/olympius',
        destination: '/competitions/olympius-cup',
        permanent: true,
      },
      {
        source: '/olympius/team/:teamSlug',
        destination: '/competitions/olympius-cup/squadre/:teamSlug',
        permanent: true,
      },
      {
        source: '/regolamento',
        destination: '/squadre',
        permanent: true,
      }
    ];
  }
};

export default nextConfig;
