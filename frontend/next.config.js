/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      "onnxruntime-web": "onnxruntime-web",
    });

    return config;
  },
};

module.exports = nextConfig;
