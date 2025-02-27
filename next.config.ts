import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // (Optional) Export as a standalone site
  // See https://nextjs.org/docs/pages/api-reference/next-config-js/output#automatically-copying-traced-files
  output: 'standalone', // Feel free to modify/remove this option
  
  // Configure allowed image domains
  images: {
    domains: ['i.ytimg.com'],
  },
  
  // Update the experimental options
  serverExternalPackages: ['sharp', 'onnxruntime-node'],
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
