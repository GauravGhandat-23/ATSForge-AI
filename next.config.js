const fs = require("fs");

// Node.js v25 Windows patch: fs.readlink on regular files incorrectly returns EISDIR instead of EINVAL.
// Webpack expects EINVAL for non-symlink paths.
const origReadlink = fs.readlink;
const origReadlinkSync = fs.readlinkSync;

if (origReadlinkSync) {
  fs.readlinkSync = function (...args) {
    try {
      return origReadlinkSync.apply(this, args);
    } catch (err) {
      if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
        err.code = "EINVAL";
      }
      throw err;
    }
  };
}

if (origReadlink) {
  fs.readlink = function (...args) {
    const cb = args[args.length - 1];
    if (typeof cb === "function") {
      args[args.length - 1] = function (err, linkString) {
        if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
          err.code = "EINVAL";
        }
        return cb(err, linkString);
      };
    }
    return origReadlink.apply(this, args);
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

module.exports = nextConfig;
