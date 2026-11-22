"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const CACHE_DIR = path.join(os.homedir(), ".dsh", "deepseek-dock");
const STATE_FILE = path.join(CACHE_DIR, "state.json");
const SESSION_FILE = path.join(CACHE_DIR, "session.json");

const RATES = {
  peak: { inputMiss: 2.0, inputHit: 0.04, output: 8.0 },
  offPeak: { inputMiss: 1.0, inputHit: 0.02, output: 4.0 }
};

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

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); }
  catch (error) { return null; }
}

function numberOf(value) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

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

function readDockState() {
  const state = readJson(STATE_FILE);
  const session = readJson(SESSION_FILE);
  const rates = state && state.rates && state.rates.flash ? state.rates.flash : RATES;
  const peak = state && typeof state.peak === "boolean" ? state.peak : isPeak(new Date());
  const rate = peak ? rates.peak : rates.offPeak;

  const usage = session && session.tokenUsage ? session.tokenUsage : {};
  const uncached = numberOf(usage.uncachedInputTokens);
  const cacheRead = numberOf(usage.cacheReadTokens);
  const cacheWrite = numberOf(usage.cacheWriteTokens);
  const output = numberOf(usage.outputTokens);
  const inputTotal = uncached + cacheRead + cacheWrite;
  const total = inputTotal + output;
  const cost = (uncached * rate.inputMiss + cacheRead * rate.inputHit + (cacheWrite + output) * rate.output) / 1e6;

  const todos = session && Array.isArray(session.todos) ? session.todos : [];
  const done = todos.filter((item) => item.status === "completed").length;
  const inProgress = todos.filter((item) => item.status === "in_progress").length;
  const balance = state && state.balance ? state.balance : null;
  const balanceAt = state && state.serverTime ? numberOf(state.serverTime) : null;
  const sessionAt = session && session.at ? numberOf(session.at) : null;
  const updatedAt = Math.max(balanceAt || 0, sessionAt || 0) || null;

  return {
    ok: true,
    mode: "desktop",
    balance: balance,
    balanceError: state && state.balanceError ? state.balanceError : null,
    balanceAt: balanceAt,
    balanceAge: balanceAt ? Date.now() - balanceAt : null,
    lowThreshold: state && typeof state.lowThreshold === "number" ? state.lowThreshold : 5,
    criticalThreshold: state && typeof state.criticalThreshold === "number" ? state.criticalThreshold : 1,
    peak: peak,
    rates: rates,
    tokens: {
      input: inputTotal,
      output: output,
      total: total,
      cacheHit: inputTotal > 0 ? cacheRead / inputTotal : 0
    },
    cost: cost,
    todos: todos,
    counts: { done: done, total: todos.length, inProgress: inProgress },
    sessionId: session && session.sessionId ? session.sessionId : null,
    sessionAt: sessionAt,
    hasSnapshot: session !== null,
    updatedAt: updatedAt
  };
}

module.exports = { readDockState, CACHE_DIR, STATE_FILE, SESSION_FILE };
