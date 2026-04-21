// Next.js auto-detects PostCSS configs up the filesystem tree, and the
// library's root `postcss.config.js` is CommonJS-style when Next expects
// ESM-object format. Define an explicit per-app config here so Next stops
// looking upward.
export default {
  plugins: {},
};
