const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const API_URL = process.env.API_URL || "http://backend:8080";

app.use(express.static(path.join(__dirname, "dist")));

// API Proxy - välitä api pyynnöt backendiin
app.use(
  "/api",
  createProxyMiddleware({
    target: API_URL,
    changeOrigin: true,
    logLevel: "debug",
    onProxyReq: (proxyReq, req, res) => {
      console.log(`[Proxy] ${req.method} ${req.url} -> ${API_URL}${req.url}`);
    },
    onError: (err, req, res) => {
      console.error("[Proxy Error]", err);
      res.status(500).json({ error: "Proxy error" });
    },
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", service: "frontend" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Proxying /api requests to ${API_URL}`);
});
