/** @type {import('next').NextConfig} */

const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'api.together.ai','res.cloudinary.com'],
  },
};

export default nextConfig;
