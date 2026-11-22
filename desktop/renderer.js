"use strict";

const dockEl = document.getElementById("dock");
const card = document.getElementById("card");
const tile = document.getElementById("tile");
const caption = document.getElementById("caption");
const refresh = document.getElementById("refresh");
const amount = document.getElementById("amount");
const currencyEl = document.getElementById("currency");
const balanceEl = document.getElementById("balance");
const peaktag = document.getElementById("peaktag");
const peaklabel = document.getElementById("peaklabel");
const sourceEl = document.getElementById("source");
const tokIn = document.getElementById("tok-in");
const tokOut = document.getElementById("tok-out");
const tokCache = document.getElementById("tok-cache");
const sessionline = document.getElementById("sessionline");
const costEl = document.getElementById("cost");
const taskcount = document.getElementById("taskcount");
const progressWrap = document.getElementById("progress-wrap");
const bar = document.getElementById("bar");
const todosEl = document.getElementById("todos");
const emptyEl = document.getElementById("empty");
const footnote = document.getElementById("footnote");
const updatedEl = document.getElementById("updated");
const tileBarFill = document.getElementById("tile-bar-fill");
const captionMoney = document.getElementById("caption-money");
const captionTask = document.getElementById("caption-task");

const CHECK_SVG = '<svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1.4 5.2 4 7.7 8.7 2.2"></path></svg>';

let state = null;
let expanded = false;

function formatTokens(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "0";
  if (number >= 1e9) return (number / 1e9).toFixed(number >= 1e10 ? 0 : 1) + "B";
  if (number >= 1e6) return (number / 1e6).toFixed(number >= 1e7 ? 0 : 1) + "M";
  if (number >= 1e3) return (number / 1e3).toFixed(number >= 1e4 ? 0 : 1) + "K";
  return String(Math.round(number));
}

function formatMoney(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "—";
  try { return number.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  catch (error) { return number.toFixed(2); }
}

function costLabel(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "¥0.00";
  if (number < 0.01) return "¥<0.01";
  return "¥" + number.toFixed(number >= 100 ? 0 : 2);
}

function percent(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return "—";
  return Math.round(number * 100) + "%";
}

function ago(timestamp) {
  if (!timestamp) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 45) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + " 分钟前";
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " 小时前";
  return Math.floor(hours / 24) + " 天前";
}

function renderTodos(items) {
  todosEl.textContent = "";
  const list = Array.isArray(items) ? items : [];
  if (list.length === 0) {
    emptyEl.hidden = false;
    progressWrap.hidden = true;
    return;
  }
  emptyEl.hidden = true;
  progressWrap.hidden = false;
  for (const item of list) {
    const li = document.createElement("li");
    li.dataset.status = item.status || "pending";
    const check = document.createElement("span");
    check.className = "dsd-check";
    check.setAttribute("aria-hidden", "true");
    if (item.status === "completed") check.innerHTML = CHECK_SVG;
    const text = document.createElement("span");
    text.className = "dsd-todo-text";
    text.textContent = String(item.content || "");
    li.appendChild(check);
    li.appendChild(text);
    todosEl.appendChild(li);
  }
}

function render(next) {
  state = next || {};
  const hasSnapshot = Boolean(state.hasSnapshot);
  const balance = state.balance || null;
  const balanceValue = balance ? Number(balance.total) : null;
  const level = balanceValue === null || !Number.isFinite(balanceValue)
    ? "none"
    : (balanceValue < (state.criticalThreshold || 1) ? "bad" : (balanceValue < (state.lowThreshold || 5) ? "warn" : "ok"));
  const currency = balance && balance.currency === "USD" ? "$" : "¥";
  const balanceText = balance ? formatMoney(balance.total) : "—";
  const low = level === "warn" || level === "bad";

  dockEl.dataset.low = low ? "true" : "false";
  caption.dataset.low = low ? "true" : "false";
  amount.dataset.level = level;
  currencyEl.textContent = currency;
  balanceEl.textContent = balanceText;

  const source = balance
    ? (state.balanceAge && state.balanceAge > 120000
        ? "上次余额 · " + ago(state.balanceAt)
        : (balance.source === "account" ? "账户" : "官方接口"))
    : (hasSnapshot ? "余额未同步" : "等待 DSH 同步");
  sourceEl.textContent = source;

  peaktag.dataset.peak = state.peak ? "true" : "false";
  peaklabel.textContent = state.peak ? "峰时" : "谷时";

  const tokens = state.tokens || {};
  tokIn.textContent = hasSnapshot ? formatTokens(tokens.input) : "—";
  tokOut.textContent = hasSnapshot ? formatTokens(tokens.output) : "—";
  tokCache.textContent = hasSnapshot ? percent(tokens.cacheHit) : "—";
  sessionline.textContent = "最近会话 · " + (hasSnapshot ? formatTokens(tokens.total) + " tokens" : "—");
  costEl.textContent = hasSnapshot ? "≈ " + costLabel(state.cost) : "≈ —";

  const counts = state.counts || { done: 0, total: 0 };
  const total = Number(counts.total) || 0;
  const done = Number(counts.done) || 0;
  const ratio = total > 0 ? done / total : 0;
  taskcount.textContent = total > 0 ? done + "/" + total : "—";
  bar.style.width = (ratio * 100).toFixed(1) + "%";
  tileBarFill.style.width = (ratio * 100).toFixed(1) + "%";
  dockEl.dataset.progress = total > 0 ? "pct" : "none";
  renderTodos(state.todos);

  captionMoney.textContent = balance ? currency + balanceText : currency + "—";
  captionTask.textContent = total > 0 ? done + "/" + total : "";

  if (!hasSnapshot) {
    footnote.textContent = "等待 DSH 同步";
  } else if (state.balanceError) {
    footnote.textContent = "余额暂时读不到";
  } else {
    footnote.textContent = "估算值，以官方账单为准";
  }
  updatedEl.textContent = state.updatedAt ? ago(state.updatedAt) : "";
  syncHeight();
}

let lastHeight = 0;

function measureHeight() {
  const wrap = document.querySelector(".dsd-tile-wrap");
  const cardHeight = card.offsetHeight || 460;
  const tileHeight = wrap ? wrap.offsetHeight : 74;
  return Math.ceil(cardHeight + tileHeight + 8 + 24);
}

function syncHeight() {
  if (!expanded) return;
  const height = measureHeight();
  if (height === lastHeight) return;
  lastHeight = height;
  window.dock.setExpanded(true, height);
}

function setOpen(value) {
  if (value === expanded) return;
  expanded = value;
  dockEl.dataset.open = value ? "true" : "false";
  card.setAttribute("aria-hidden", value ? "false" : "true");
  tile.setAttribute("aria-expanded", value ? "true" : "false");
  caption.setAttribute("aria-expanded", value ? "true" : "false");
  if (value) {
    lastHeight = 0;
    syncHeight();
  } else {
    setTimeout(function () { window.dock.setExpanded(false, 0); }, 320);
  }
}

tile.addEventListener("click", function () { setOpen(!expanded); });
caption.addEventListener("click", function () { setOpen(!expanded); });
document.addEventListener("pointerdown", function (event) {
  if (!expanded) return;
  if (card.contains(event.target) || tile.contains(event.target) || caption.contains(event.target)) return;
  setOpen(false);
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") setOpen(false);
});

refresh.addEventListener("click", function () {
  refresh.dataset.busy = "true";
  window.dock.refresh().then(function (next) {
    render(next);
    setTimeout(function () { refresh.dataset.busy = "false"; }, 400);
  }).catch(function () {
    refresh.dataset.busy = "false";
  });
});

window.dock.onState(function (next) { render(next); });
window.dock.getState().then(function (next) { render(next); }).catch(function () { render({}); });

render({});
