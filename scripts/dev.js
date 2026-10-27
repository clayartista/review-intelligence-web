"use strict";

const { spawn } = require("node:child_process");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const python = process.env.VISION_PYTHON || "python";
const processes = [];
let stopping = false;

function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;

  for (const child of processes) {
    if (child && child.exitCode === null && !child.killed) {
      child.kill();
    }
  }
}

function start(command, args, name) {
  const child = spawn(command, args, {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  processes.push(child);

  child.on("error", (error) => {
    console.error(`Failed to start ${name}: ${error.message}`);
    if (name === "vision backend") {
      console.error(
        "Set VISION_PYTHON to a Python executable with backend/requirements-vision.txt installed."
      );
    }
    stop(1);
  });

  child.on("close", (code) => {
    if (!stopping) {
      stop(code || 0);
    }
  });
}

process.on("SIGINT", () => stop(0));
process.on("SIGTERM", () => stop(0));

start(
  python,
  [
    "-m",
    "uvicorn",
    "vision.api:app",
    "--app-dir",
    path.join(root, "backend", "src"),
    "--host",
    "127.0.0.1",
    "--port",
    "8001",
  ],
  "vision backend"
);
if (!process.argv.includes("--vision-only")) {
  start(
    process.execPath,
    [path.join(root, "node_modules", "next", "dist", "bin", "next"), "dev"],
    "Next.js"
  );
}
