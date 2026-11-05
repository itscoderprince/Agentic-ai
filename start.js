import { spawn, exec } from "child_process";
import readline from "readline";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ANSI Colors for readable console output
const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  gateway: "\x1b[34m",   // Blue
  auth: "\x1b[32m",      // Green
  chat: "\x1b[36m",      // Cyan
  agent: "\x1b[35m",     // Magenta
  frontend: "\x1b[33m",  // Yellow
  redis: "\x1b[31m",     // Red
  info: "\x1b[90m",      // Gray
};

const services = [
  { name: "GATEWAY ", color: colors.gateway, dir: "backend/services/gateway", cmd: "npm", args: ["run", "dev"] },
  { name: "AUTH    ", color: colors.auth,    dir: "backend/services/auth",    cmd: "npm", args: ["run", "dev"] },
  { name: "CHAT    ", color: colors.chat,    dir: "backend/services/chat",    cmd: "npm", args: ["run", "dev"] },
  { name: "AGENT   ", color: colors.agent,   dir: "backend/services/agent",   cmd: "npm", args: ["run", "dev"] },
  { name: "FRONTEND", color: colors.frontend,dir: "frontend",                 cmd: "npm", args: ["run", "dev"] },
];

const children = [];
let isShuttingDown = false;

// 1. Try to start Redis via Docker Compose (Graceful if Docker is not installed/running)
function startRedis() {
  return new Promise((resolve) => {
    exec("docker-compose -f backend/docker-compose.yml up -d", (error) => {
      if (error) {
        console.log(`${colors.redis}[REDIS   ]${colors.reset} ℹ️  Docker not detected or offline. (Using local/cloud Redis URL if set in .env)`);
      } else {
        console.log(`${colors.redis}[REDIS   ]${colors.reset} ✅ Redis container started on port 6379`);
      }
      resolve();
    });
  });
}

// 2. Stream logs line-by-line with color-coded service labels
function attachLogger(stream, label, color) {
  if (!stream) return;
  const rl = readline.createInterface({ input: stream });
  rl.on("line", (line) => {
    if (!line.trim()) return;
    console.log(`${color}[${label}]${colors.reset} ${line}`);
  });
}

// 3. Spawn a microservice process
function startService(svc) {
  const cwd = path.resolve(__dirname, svc.dir);
  const child = spawn(svc.cmd, svc.args, {
    cwd,
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  attachLogger(child.stdout, svc.name, svc.color);
  attachLogger(child.stderr, svc.name, svc.color);

  child.on("exit", (code) => {
    if (!isShuttingDown) {
      console.log(`${svc.color}[${svc.name}]${colors.reset} ⚠️ Process exited with code ${code}`);
    }
  });

  children.push(child);
}

// 4. Clean exit handler: Kills all child process trees cleanly on Windows & POSIX
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n${colors.bold}🛑 Stopping all Agentic AI services...${colors.reset}`);

  for (const child of children) {
    if (child && child.pid) {
      if (process.platform === "win32") {
        exec(`taskkill /pid ${child.pid} /T /F`, () => {});
      } else {
        child.kill("SIGTERM");
      }
    }
  }

  setTimeout(() => {
    console.log(`${colors.bold}👋 All services stopped cleanly.${colors.reset}\n`);
    process.exit(0);
  }, 1000);
}

// Handle termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);

// 5. Main Execution
async function main() {
  console.clear();
  console.log(`${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.bold}🚀  AGENTIC AI — FULL-STACK DEVELOPMENT RUNNER${colors.reset}`);
  console.log(`${colors.bold}================================================================${colors.reset}`);
  console.log(`${colors.gateway}• Gateway Service : http://localhost:1000${colors.reset}`);
  console.log(`${colors.auth}• Auth Service    : http://localhost:2000${colors.reset}`);
  console.log(`${colors.chat}• Chat Service    : http://localhost:3000${colors.reset}`);
  console.log(`${colors.agent}• Agent Service   : http://localhost:4000${colors.reset}`);
  console.log(`${colors.frontend}• React Frontend  : http://localhost:5173${colors.reset}`);
  console.log(`${colors.info}----------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.info}Press Ctrl+C at any time to stop all services simultaneously.${colors.reset}`);
  console.log(`${colors.bold}================================================================${colors.reset}\n`);

  await startRedis();

  services.forEach((svc) => {
    startService(svc);
  });
}

main();

