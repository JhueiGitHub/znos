const nextConfig = {
  webpack: (config) => {
    // Existing externals configuration
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
      canvas: "commonjs canvas",
    });

    // Add font handling configuration
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: "asset/resource",
      generator: {
        filename: "static/fonts/[hash][ext][query]",
      },
    });

    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      "uploadthing.com",
      "utfs.io",
      "img.clerk.com",
      "images.clerk.dev",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "liveblocks.io",
        port: "",
      },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
