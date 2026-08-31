// BuzzCast hold-patch — aja: node patch.js
const fs = require("fs");
const path = require("path");

const root = __dirname;
const serverPath = path.join(root, "server.js");
const appPath = path.join(root, "public", "app.js");

if (!fs.existsSync(serverPath)) {
  console.error("ERROR: server.js not found in", root);
  process.exit(1);
}

const appJs = `const params = new URLSearchParams(location.search);
const player = Number(params.get("player"));

const label = document.getElementById("label");
const conn = document.getElementById("conn");
const changeNameBtn = document.getElementById("change-name");

applyI18n();

let ws;
let ready = false;
let activeButton = null;

function getName() {
  return localStorage.getItem("buzz_name") || "";
}

function askName(force) {
  const current = getName();
  if (!force && current) return current;
  const input = prompt(t("name_prompt"), current) ?? current;
  const trimmed = input.trim().slice(0, 20);
  const final = trimmed || current || t("default_name", player);
  localStorage.setItem("buzz_name", final);
  return final;
}

function updateLabel() {
  const name = getName() || t("default_name", player);
  label.textContent = name;
}

function setConn(ok) {
  conn.classList.toggle("on", ok);
  conn.title = ok ? "Connected" : "Disconnected";
}

function sendButton(action, button) {
  if (!ready || !ws || ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: "button", button, action }));
}

function releaseActiveButton() {
  if (!activeButton) return;
  sendButton("up", activeButton);
  document.querySelectorAll("[data-button].active").forEach((el) => el.classList.remove("active"));
  activeButton = null;
}

function connect() {
  const wsProto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(wsProto + "//" + location.host);
  ws.onopen = () => {
    setConn(true);
    ws.send(JSON.stringify({ type: "join", player, name: getName() }));
  };
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.type === "join_result") {
      if (msg.ok) {
        ready = true;
      } else {
        alert(t("join_failed", msg.reason));
        location.href = "index.html";
      }
    }
  };
  ws.onclose = () => {
    setConn(false);
    ready = false;
    activeButton = null;
    document.querySelectorAll("[data-button].active").forEach((el) => el.classList.remove("active"));
    setTimeout(connect, 1000);
  };
}

askName(false);
updateLabel();
connect();

changeNameBtn.addEventListener("click", () => {
  askName(true);
  updateLabel();
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: "join", player, name: getName() }));
  }
});

function buttonDown(button, el) {
  if (!ready || !ws || ws.readyState !== WebSocket.OPEN) return;
  if (activeButton && activeButton !== button) releaseActiveButton();
  if (activeButton === button) return;

  activeButton = button;
  sendButton("down", button);
  if (navigator.vibrate) navigator.vibrate(30);
  el.classList.add("active");
}

function buttonUp(el) {
  if (!activeButton) {
    el.classList.remove("active");
    return;
  }
  sendButton("up", activeButton);
  document.querySelectorAll("[data-button].active").forEach((node) => node.classList.remove("active"));
  activeButton = null;
}

document.querySelectorAll("[data-button]").forEach((el) => {
  const btn = el.dataset.button;
  const onDown = (e) => {
    e.preventDefault();
    buttonDown(btn, el);
  };
  const onUp = (e) => {
    e.preventDefault();
    buttonUp(el);
  };
  el.addEventListener("touchstart", onDown, { passive: false });
  el.addEventListener("touchend", onUp, { passive: false });
  el.addEventListener("touchcancel", onUp, { passive: false });
  el.addEventListener("mousedown", onDown);
  el.addEventListener("mouseup", onUp);
  el.addEventListener("mouseleave", onUp);
});

window.addEventListener("pagehide", () => {
  releaseActiveButton();
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: "leave" }));
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") releaseActiveButton();
});
`;

const heldBlock = `
const HELD = new Map();

function heldSet(player) {
  if (!HELD.has(player)) HELD.set(player, new Set());
  return HELD.get(player);
}
`;

const oldTapKey = `async function tapKey(player, button) {
  const map = KEYMAP[player];
  if (!map) return;
  const keyName = map[button];
  if (!keyName || !(keyName in Key)) {
    console.warn(\`[aviso] tecla invalida: P\${player} \${button} -> \${keyName}\`);
    return;
  }
  const code = Key[keyName];
  try {
    await keyboard.pressKey(code);
    await keyboard.releaseKey(code);
  } catch (err) {
    console.error("[erro] emular tecla:", err.message);
  }
}`;

const newTapKey = `function resolveKey(player, button) {
  const map = KEYMAP[player];
  if (!map) return null;
  const keyName = map[button];
  if (!keyName || !(keyName in Key)) {
    console.warn(\`[aviso] tecla invalida: P\${player} \${button} -> \${keyName}\`);
    return null;
  }
  return Key[keyName];
}

async function keyDown(player, button) {
  const code = resolveKey(player, button);
  if (!code) return;
  const held = heldSet(player);
  if (held.has(button)) return;
  held.add(button);
  try {
    await keyboard.pressKey(code);
  } catch (err) {
    held.delete(button);
    console.error("[erro] keyDown:", err.message);
  }
}

async function keyUp(player, button) {
  const code = resolveKey(player, button);
  if (!code) return;
  heldSet(player).delete(button);
  try {
    await keyboard.releaseKey(code);
  } catch (err) {
    console.error("[erro] keyUp:", err.message);
  }
}

async function releaseAllForPlayer(player) {
  const held = HELD.get(player);
  if (!held || held.size === 0) return;
  for (const button of [...held]) {
    await keyUp(player, button);
  }
  HELD.delete(player);
}

async function tapKey(player, button) {
  await keyDown(player, button);
  await new Promise((r) => setTimeout(r, 80));
  await keyUp(player, button);
}`;

const buttonHandler = `    if (data.type === "button") {
      if (!ws.player) return;
      if (data.action === "down") await keyDown(ws.player, data.button);
      else if (data.action === "up") await keyUp(ws.player, data.button);
      return;
    }

`;

let server = fs.readFileSync(serverPath, "utf8");

if (!server.includes("const HELD = new Map")) {
  server = server.replace(
    "keyboard.config.autoDelayMs = 0;\n",
    "keyboard.config.autoDelayMs = 0;\n" + heldBlock
  );
}

if (server.includes(oldTapKey)) {
  server = server.replace(oldTapKey, newTapKey);
} else if (!server.includes("async function keyDown")) {
  console.error("ERROR: server.js structure not recognized");
  process.exit(1);
}

if (!server.includes('data.type === "button"')) {
  server = server.replace(
    '    if (data.type === "press") {',
    buttonHandler + '    if (data.type === "press") {'
  );
  server = server.replace(
    `  ws.on("close", () => {
    if (ws.player && slots[ws.player] === ws) {`,
    `  ws.on("close", async () => {
    if (ws.player) await releaseAllForPlayer(ws.player);
    if (ws.player && slots[ws.player] === ws) {`
  );
}

fs.writeFileSync(serverPath, server);
fs.writeFileSync(appPath, appJs);

console.log("OK server.js");
console.log("OK public/app.js");
console.log("");
console.log("Next: npm install");
console.log("Then: node server.js");
