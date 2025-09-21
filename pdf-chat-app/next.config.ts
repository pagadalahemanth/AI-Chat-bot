/** @type {import('next').NextConfig} */
const webpack = require('webpack');
const nextConfig = {
  experimental: {
    serverActions: {},
  },
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // Fix for pdf-parse module
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    // Ignore pdf-parse test files
config.plugins.push(
  new webpack.IgnorePlugin({
    resourceRegExp: /^\.\/test\/.*$/,
    contextRegExp: /pdf-parse$/,
  })
);


    return config;
  },
}

module.exports = nextConfig