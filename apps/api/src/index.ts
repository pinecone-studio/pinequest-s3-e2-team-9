import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "api",
    port,
  });
});

app.get("/api/hello", (_req, res) => {
  res.json({
    message: "Hello from the Pinequest API",
  });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
