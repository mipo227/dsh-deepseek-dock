/**
 * dsh-deepseek-dock — host half.
 *
 * Exposes one loopback-only route for the floating DeepSeek dock:
 *   GET /api/deepseek-dock/state  → account balance + current price table
 *
 * Balance resolution mirrors the official account surface: the signed-in
 * DeepSeek account service first (no API key needed), then the public
 * /user/balance endpoint with the DEEPSEEK_API_KEY credential.
 *
 * The browser half reads token usage and todo progress from DSH session
 * projections, so this host file only owns the account query and pricing.
 * It also mirrors balance and the latest browser snapshot into
 * ~/.dsh/deepseek-dock/ for the standalone desktop widget.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const name = "deepseek-dock";

/** The web server is the only mandatory service; credentials/account are optional. */
export const inject = ["webServer"];

const ROUTE = "/api/deepseek-dock/state";
const ACCOUNT_SERVICE = "deepseekAccount";
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_API_KEY_ENV = "DEEPSEEK_API_KEY";
const REQUEST_TIMEOUT_MS = 6500;
const CACHE_TTL_MS = 60_000;
const FAILURE_TTL_MS = 20_000;
const STALE_TTL_MS = 10 * 60_000;
const SNAPSHOT_ROUTE = "/api/deepseek-dock/snapshot";
const CACHE_DIR = path.join(os.homedir(), ".dsh", "deepseek-dock");
const STATE_FILE = path.join(CACHE_DIR, "state.json");
const SESSION_FILE = path.join(CACHE_DIR, "session.json");
const SNAPSHOT_MAX_BYTES = 512 * 1024;

/** CNY per 1M tokens, official DeepSeek V4.1 rates (2026-09). */
const RATES = {
  flash: {
    peak: { inputMiss: 2.0, inputHit: 0.04, output: 8.0 },
    offPeak: { inputMiss: 1.0, inputHit: 0.02, output: 4.0 }
  },
  pro: {
    peak: { inputMiss: 9.0, inputHit: 0.30, output: 27.0 },
    offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 }
  }
};

/**
 * Statutory holiday dates (Beijing calendar) of the 2026 State Council
 * arrangement, 国办发明电〔2025〕7号. DeepSeek bills weekdays 09:00-12:00 and
 * 14:00-18:00 Beijing time as peak, excluding statutory holidays; weekends
 * (including 调休 workdays) are off-peak all day.
 */
const CN_HOLIDAYS_2026 = new Set([
  "2026-01-01", "2026-01-02", "2026-01-03",
  "2026-02-15", "2026-02-16", "2026-02-17", "2026-02-18", "2026-02-19",
  "2026-02-20", "2026-02-21", "2026-02-22", "2026-02-23",
  "2026-04-04", "2026-04-05", "2026-04-06",
  "2026-05-01", "2026-05-02", "2026-05-03", "2026-05-04", "2026-05-05",
  "2026-06-19", "2026-06-20", "2026-06-21",
  "2026-09-25", "2026-09-26", "2026-09-27",
  "2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-05",
  "2026-10-06", "2026-10-07"
]);

let cache = { at: 0, value: null, lastGood: null, lastGoodAt: 0 };

function beijingDay(date) {
  const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const month = String(beijing.getUTCMonth() + 1).padStart(2, "0");
  const day = String(beijing.getUTCDate()).padStart(2, "0");
  return String(beijing.getUTCFullYear()) + "-" + month + "-" + day;
}

function isPeak(date) {
  const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
  const day = beijing.getUTCDay();
  if (day === 0 || day === 6) return false;
  if (CN_HOLIDAYS_2026.has(beijingDay(date))) return false;
  const hour = beijing.getUTCHours();
  return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
}

/** A platform wallet amount as integer cents, truncated below a cent. */
function centsOf(value) {
  const match = /^(-?)(\d+)(?:\.(\d+))?$/.exec(String(value == null ? "" : value).trim());
  if (match === null) return null;
  const cents = BigInt(match[2]) * 100n + BigInt((match[3] || "").slice(0, 2).padEnd(2, "0"));
  return match[1] === "-" ? -cents : cents;
}

function formatCents(cents) {
  const negative = cents < 0n;
  const absolute = negative ? -cents : cents;
  const text = String(absolute / 100n) + "." + String(absolute % 100n).padStart(2, "0");
  return negative ? "-" + text : text;
}

function writeJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(payload),
    "cache-control": "no-store"
  });
  res.end(payload);
}

function isLoopbackRequest(req) {
  const address = (req.socket && req.socket.remoteAddress) || "";
  return address === "::1"
    || address === "::ffff:127.0.0.1"
    || address === "127.0.0.1"
    || address === "localhost"
    || address.startsWith("::ffff:127.");
}

/** Reshape the account service's wallet view into a single display balance. */
function shapeAccountBalance(view) {
  if (view == null || view.status !== "ready") return null;
  const wallets = Array.isArray(view.value) ? view.value : [];
  const bonuses = Array.isArray(view.bonusWallets) ? view.bonusWallets : [];
  const currencies = [];
  for (const wallet of wallets.concat(bonuses)) {
    if (wallet && typeof wallet.currency === "string" && currencies.indexOf(wallet.currency) === -1) {
      currencies.push(wallet.currency);
    }
  }
  if (currencies.length === 0) return null;
  const currency = currencies.indexOf("CNY") !== -1
    ? "CNY"
    : (currencies.indexOf("USD") !== -1 ? "USD" : currencies[0]);
  const sum = (list) => list.reduce((total, wallet) => {
    if (!wallet || wallet.currency !== currency) return total;
    const cents = centsOf(wallet.balance);
    return cents === null ? total : total + cents;
  }, 0n);
  const toppedUp = sum(wallets);
  const granted = sum(bonuses);
  return {
    currency: currency,
    total: formatCents(toppedUp + granted),
    granted: formatCents(granted),
    toppedUp: formatCents(toppedUp),
    source: "account"
  };
}

async function resolveApiKey(ctx, apiKeyEnv) {
  try {
    const credentials = ctx.get("credentials");
    if (credentials != null) {
      const hit = await credentials.resolve(apiKeyEnv);
      if (hit !== void 0 && hit.value !== void 0 && hit.value !== "") return hit.value;
    }
  } catch (error) {
    logWarn(ctx, "credentials resolve failed: " + messageOf(error));
  }
  try {
    const environment = ctx.get("launchEnvironment");
    if (environment != null) {
      const entry = environment.get(apiKeyEnv);
      if (entry !== void 0 && entry.value.length > 0) return entry.value;
    }
  } catch (error) {
    /* fall through to process env */
  }
  const ambient = process.env[apiKeyEnv];
  return ambient !== void 0 && ambient !== "" ? ambient : void 0;
}

async function fetchAccountBalance(ctx) {
  let account;
  try {
    account = ctx.get(ACCOUNT_SERVICE);
  } catch (error) {
    return null;
  }
  if (account == null || typeof account.getBalance !== "function") return null;
  try {
    const view = await account.getBalance({
      version: "dsh-deepseek-dock/1.0",
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
      timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60
    });
    return shapeAccountBalance(view);
  } catch (error) {
    logWarn(ctx, "account balance read failed: " + messageOf(error));
    return null;
  }
}

async function fetchApiBalance(ctx, baseURL, apiKeyEnv) {
  const apiKey = await resolveApiKey(ctx, apiKeyEnv);
  if (apiKey === void 0) return { error: "no " + apiKeyEnv + " credential and no signed-in account" };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(String(baseURL).replace(/\/+$/, "") + "/user/balance", {
      headers: { authorization: "Bearer " + apiKey, accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return { error: "balance endpoint responded " + response.status + ": " + text.slice(0, 160) };
    }
    const payload = await response.json();
    const infos = Array.isArray(payload.balance_infos) ? payload.balance_infos : [];
    if (infos.length === 0) return { error: "balance endpoint returned no balance_infos" };
    const info = infos.find((item) => item.currency === "CNY") || infos[0];
    return {
      value: {
        currency: info.currency || "CNY",
        total: String(info.total_balance == null ? "0" : info.total_balance),
        granted: String(info.granted_balance == null ? "0" : info.granted_balance),
        toppedUp: String(info.topped_up_balance == null ? "0" : info.topped_up_balance),
        source: "apikey"
      }
    };
  } catch (error) {
    return { error: messageOf(error) };
  } finally {
    clearTimeout(timer);
  }
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

function logWarn(ctx, message) {
  try {
    if (ctx.logger && typeof ctx.logger.warn === "function") {
      ctx.logger.warn("[deepseek-dock] " + message);
    }
  } catch (error) {
    /* logging must never break the route */
  }
}

async function readBalance(ctx, config) {
  const account = await fetchAccountBalance(ctx);
  if (account !== null) return { balance: account, error: null };
  const fallback = await fetchApiBalance(ctx, config.balanceBaseURL, config.balanceApiKeyEnv);
  if (fallback.value !== void 0) return { balance: fallback.value, error: null };
  return { balance: null, error: fallback.error };
}

function resolveConfig(raw) {
  const value = raw == null ? {} : raw;
  return {
    balanceBaseURL: typeof value.balanceBaseURL === "string" && value.balanceBaseURL !== ""
      ? value.balanceBaseURL
      : DEFAULT_BASE_URL,
    balanceApiKeyEnv: typeof value.balanceApiKeyEnv === "string" && value.balanceApiKeyEnv !== ""
      ? value.balanceApiKeyEnv
      : DEFAULT_API_KEY_ENV,
    lowThreshold: typeof value.lowThreshold === "number" && value.lowThreshold >= 0
      ? value.lowThreshold
      : 5,
    criticalThreshold: typeof value.criticalThreshold === "number" && value.criticalThreshold >= 0
      ? value.criticalThreshold
      : 1
  };
}

function numberOf(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function writeJsonAtomic(file, value) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const temp = file + ".tmp";
    fs.writeFileSync(temp, JSON.stringify(value));
    fs.renameSync(temp, file);
  } catch (error) {
    try { console.warn("[deepseek-dock] cache write failed: " + messageOf(error)); } catch (_) {}
  }
}

function readRequestBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const fail = (error) => {
      if (settled) return;
      settled = true;
      reject(error);
    };
    req.on("data", (chunk) => {
      if (settled) return;
      size += chunk.length;
      if (size > limit) {
        fail(new Error("snapshot body too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (settled) return;
      settled = true;
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", fail);
  });
}

function makeSnapshotHandler() {
  return async function handler(req, res) {
    if (!isLoopbackRequest(req)) {
      writeJson(res, 403, { ok: false, error: "forbidden: loopback-only" });
      return;
    }
    if ((req.method || "GET") !== "POST") {
      writeJson(res, 405, { ok: false, error: "method not allowed" });
      return;
    }
    try {
      const body = await readRequestBody(req, SNAPSHOT_MAX_BYTES);
      const data = JSON.parse(body);
      if (data === null || typeof data !== "object" || Array.isArray(data)) {
        writeJson(res, 400, { ok: false, error: "invalid snapshot" });
        return;
      }
      const todos = Array.isArray(data.todos)
        ? data.todos.slice(0, 200).map((item) => ({
            content: String((item && item.content) || "").slice(0, 500),
            status: item && ["pending", "in_progress", "completed"].includes(item.status)
              ? item.status
              : "pending"
          }))
        : null;
      const usage = data.tokenUsage && typeof data.tokenUsage === "object"
        ? {
            uncachedInputTokens: numberOf(data.tokenUsage.uncachedInputTokens),
            outputTokens: numberOf(data.tokenUsage.outputTokens),
            cacheReadTokens: numberOf(data.tokenUsage.cacheReadTokens),
            cacheWriteTokens: numberOf(data.tokenUsage.cacheWriteTokens)
          }
        : null;
      const goal = data.goal && typeof data.goal === "object" && typeof data.goal.objective === "string"
        ? {
            objective: data.goal.objective.slice(0, 500),
            phase: typeof data.goal.phase === "string" ? data.goal.phase : "active",
            roundsStarted: numberOf(data.goal.roundsStarted),
            maxGoalRounds: numberOf(data.goal.maxGoalRounds)
          }
        : null;
      writeJsonAtomic(SESSION_FILE, {
        version: 1,
        sessionId: String(data.sessionId || "").slice(0, 200),
        at: numberOf(data.at) || Date.now(),
        todos: todos,
        tokenUsage: usage,
        goal: goal
      });
      writeJson(res, 200, { ok: true });
    } catch (error) {
      writeJson(res, 400, { ok: false, error: messageOf(error) });
    }
  };
}

async function buildState(ctx, config, force) {
  const now = Date.now();
  const ttl = cache.value === null ? FAILURE_TTL_MS : CACHE_TTL_MS;
  if (!force && cache.value !== null && now - cache.at < ttl) return cache.value;

  const result = await readBalance(ctx, config);
  let balance = result.balance;
  let stale = false;
  if (balance === null && cache.lastGood !== null && now - cache.lastGoodAt < STALE_TTL_MS) {
    balance = cache.lastGood;
    stale = true;
  }
  if (balance !== null) {
    cache.lastGood = balance;
    cache.lastGoodAt = now;
  }

  const peak = isPeak(new Date(now));
  const state = {
    ok: true,
    cacheVersion: 1,
    balance: balance,
    balanceError: balance === null ? (result.error || "balance unavailable") : null,
    stale: stale,
    peak: peak,
    peakLabel: peak ? "峰时" : "谷时",
    rates: RATES,
    lowThreshold: config.lowThreshold,
    criticalThreshold: config.criticalThreshold,
    serverTime: now
  };
  cache = { at: now, value: state, lastGood: cache.lastGood, lastGoodAt: cache.lastGoodAt };
  writeJsonAtomic(STATE_FILE, state);
  return state;
}

function makeHandler(ctx, config) {
  return async function handler(req, res) {
    if (!isLoopbackRequest(req)) {
      writeJson(res, 403, { ok: false, error: "forbidden: loopback-only" });
      return;
    }
    if ((req.method || "GET") !== "GET") {
      writeJson(res, 405, { ok: false, error: "method not allowed" });
      return;
    }
    const url = new URL(req.url || "/", "http://localhost");
    const force = url.searchParams.get("refresh") === "1";
    try {
      const state = await buildState(ctx, config, force);
      writeJson(res, 200, state);
    } catch (error) {
      writeJson(res, 500, { ok: false, error: messageOf(error) });
    }
  };
}

export function apply(ctx, rawConfig) {
  const config = resolveConfig(rawConfig);
  const disposers = [
    ctx.webServer.register({
      kind: "exact",
      path: ROUTE,
      handler: makeHandler(ctx, config)
    }),
    ctx.webServer.register({
      kind: "exact",
      path: SNAPSHOT_ROUTE,
      handler: makeSnapshotHandler()
    })
  ];
  const warm = () => {
    buildState(ctx, config, true).catch((error) => {
      try { console.warn("[deepseek-dock] warm balance failed: " + messageOf(error)); } catch (_) {}
    });
  };
  const timer = setInterval(warm, 5 * 60 * 1000);
  if (typeof timer.unref === "function") timer.unref();
  const first = setTimeout(warm, 2500);
  if (typeof first.unref === "function") first.unref();
  ctx.effect(() => () => {
    clearInterval(timer);
    clearTimeout(first);
    for (const dispose of disposers) {
      if (typeof dispose === "function") dispose();
    }
  }, "deepseek-dock: routes");
}
