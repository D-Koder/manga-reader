const { createProxyMiddleware } = require("http-proxy-middleware");

// Dev only: Create React App loads this file automatically.
// Forwards /api/* from the dev server to MangaDex, so the browser talks to
// the laptop instead of MangaDex and CORS does not apply.
module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "https://api.mangadex.org",
      changeOrigin: true,
      pathRewrite: { "^/api": "" },
    })
  );
};
