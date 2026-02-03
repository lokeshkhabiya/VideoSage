import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Do not use output: 'standalone' on Vercel; Vercel uses its own deployment output.

  // Configure allowed image domains
  images: {
    domains: ['i.ytimg.com'],
  },

  // Externalize native packages that may not bundle well on Vercel
  serverExternalPackages: ['sharp'],
  webpack: (config, { isServer }) => {
    // Add rule for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: [
        {
          loader: "file-loader",
          options: {
            name: '[name].[ext]',
            outputPath: 'static/chunks/',
            publicPath: '_next/static/chunks/'
          }
        }
      ]
    });

    // Exclude sharp from being bundled on the client side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        sharp: false
      };
    }

    return config;
  },
};

export default nextConfig;
