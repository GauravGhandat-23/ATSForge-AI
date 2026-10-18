const fs = require("fs");

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

if (fs.promises && fs.promises.readlink) {
  const origPromisesReadlink = fs.promises.readlink;
  fs.promises.readlink = async function (...args) {
    try {
      return await origPromisesReadlink.apply(this, args);
    } catch (err) {
      if (err && (err.code === "EISDIR" || err.code === "UNKNOWN")) {
        err.code = "EINVAL";
      }
      throw err;
    }
  };
}
