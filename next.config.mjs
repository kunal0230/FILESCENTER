/** @type {import('next').NextConfig} */
const nextConfig = {
  // Webpack config for PDF.js and qpdf-wasm
  webpack: (config) => {
    config.resolve.alias.canvas = false;

    // Fix for qpdf-wasm using fs/path/module
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      module: false,
      crypto: false,
      stream: false,
    };

    return config;
  }
};

export default nextConfig;
