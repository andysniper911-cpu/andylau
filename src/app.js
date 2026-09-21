import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(express.json());

  const tasks = [];
  let nextId = 1;

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.get("/api/tasks", (_req, res) => {
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }
    const task = { id: nextId++, title, done: false };
    tasks.push(task);
    res.status(201).json(task);
  });

  app.patch("/api/tasks/:id", (req, res) => {
    const task = tasks.find((t) => t.id === Number(req.params.id));
    if (!task) {
      return res.status(404).json({ error: "task not found" });
    }
    if (typeof req.body?.done === "boolean") {
      task.done = req.body.done;
    }
    res.json(task);
  });

  app.delete("/api/tasks/:id", (req, res) => {
    const index = tasks.findIndex((t) => t.id === Number(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "task not found" });
    }
    const [removed] = tasks.splice(index, 1);
    res.json(removed);
  });

  app.use(express.static(path.join(__dirname, "..", "public")));

  return app;
}
