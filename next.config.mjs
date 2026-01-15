import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust Worker Handling: Copy worker to public on startup to ensure version match
try {
  const workerSrc = path.join(__dirname, 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js');
  const workerDest = path.join(__dirname, 'public', 'pdf.worker.min.js');

  // Ensure public dir exists
  if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
  }

  fs.copyFileSync(workerSrc, workerDest);
  console.log('✅ PDF Worker initialized successfully at public/pdf.worker.min.js');
} catch (e) {
  console.warn('⚠️ Failed to initialize PDF Worker:', e.message);
}

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
