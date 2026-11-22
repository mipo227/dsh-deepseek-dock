window.__ModuleLoader__.load({
  id: 'dsh-deepseek-dock',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    var React = require('react');
    var ReactDOM = require('react-dom');
    var h = React.createElement;

    var CSS = ".dsd-root {\n  position: fixed;\n  right: 18px;\n  bottom: 18px;\n  z-index: 2147482600;\n  display: flex;\n  flex-direction: column;\n  align-items: flex-end;\n  gap: 9px;\n  pointer-events: none;\n  color: #f5f5f7;\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"PingFang SC\", \"Helvetica Neue\", Arial, sans-serif;\n  font-size: 12px;\n  line-height: 1.4;\n  -webkit-font-smoothing: antialiased;\n  text-rendering: geometricPrecision;\n  user-select: none;\n  --dsd-line: rgba(255, 255, 255, 0.10);\n  --dsd-dim: rgba(245, 245, 247, 0.52);\n  --dsd-faint: rgba(245, 245, 247, 0.30);\n  --dsd-warn: #ffb340;\n  --dsd-bad: #ff5a4f;\n  --dsd-ok: #8be28b;\n}\n\n.dsd-root[data-open=\"true\"] { z-index: 2147482601; }\n\n.dsd-card {\n  position: relative;\n  width: 300px;\n  max-height: min(72vh, 532px);\n  padding: 15px 15px 12px;\n  border-radius: 22px;\n  overflow: hidden;\n  pointer-events: auto;\n  visibility: hidden;\n  opacity: 0;\n  transform: translateY(12px) scale(0.965);\n  transform-origin: 100% 100%;\n  filter: blur(7px);\n  transition:\n    opacity 0.26s ease,\n    transform 0.44s cubic-bezier(0.16, 1, 0.3, 1),\n    filter 0.3s ease,\n    visibility 0s linear 0.44s;\n  background:\n    radial-gradient(140% 90% at 12% -10%, rgba(255, 255, 255, 0.14), transparent 56%),\n    radial-gradient(90% 70% at 100% 110%, rgba(140, 180, 255, 0.08), transparent 62%),\n    linear-gradient(155deg, rgba(31, 31, 35, 0.80), rgba(6, 6, 8, 0.90));\n  backdrop-filter: blur(42px) saturate(180%);\n  -webkit-backdrop-filter: blur(42px) saturate(180%);\n  border: 1px solid rgba(255, 255, 255, 0.12);\n  box-shadow:\n    0 30px 90px rgba(0, 0, 0, 0.66),\n    0 6px 22px rgba(0, 0, 0, 0.46),\n    inset 0 1px 0 rgba(255, 255, 255, 0.22),\n    inset 0 -1px 0 rgba(255, 255, 255, 0.04);\n}\n\n.dsd-root[data-open=\"true\"] .dsd-card {\n  visibility: visible;\n  opacity: 1;\n  transform: none;\n  filter: none;\n  transition-delay: 0s;\n}\n\n.dsd-card::before {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  padding: 1px;\n  border-radius: inherit;\n  pointer-events: none;\n  background: linear-gradient(\n    150deg,\n    rgba(255, 255, 255, 0.56),\n    rgba(255, 255, 255, 0.10) 24%,\n    rgba(255, 255, 255, 0.02) 52%,\n    rgba(255, 255, 255, 0.16) 78%,\n    rgba(255, 255, 255, 0.44)\n  );\n  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  -webkit-mask-composite: xor;\n  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);\n  mask-composite: exclude;\n  opacity: 0.74;\n}\n\n.dsd-card::after {\n  content: \"\";\n  position: absolute;\n  inset: -1px;\n  border-radius: inherit;\n  pointer-events: none;\n  background:\n    radial-gradient(\n      270px circle at var(--mx, 72%) var(--my, 0%),\n      rgba(255, 255, 255, 0.22),\n      transparent 60%\n    ),\n    linear-gradient(118deg, rgba(255, 255, 255, 0.07), transparent 28%, transparent 72%, rgba(255, 255, 255, 0.035));\n  opacity: 0.92;\n  mix-blend-mode: screen;\n}\n\n.dsd-aurora {\n  position: absolute;\n  inset: -70px;\n  z-index: 0;\n  pointer-events: none;\n  opacity: 0.34;\n  background:\n    radial-gradient(38% 38% at 28% 30%, rgba(255, 255, 255, 0.26), transparent 62%),\n    radial-gradient(34% 34% at 72% 66%, rgba(130, 170, 255, 0.16), transparent 66%),\n    radial-gradient(40% 40% at 55% 16%, rgba(255, 255, 255, 0.10), transparent 60%);\n  filter: blur(24px);\n  animation: dsd-drift 18s ease-in-out infinite alternate;\n}\n\n.dsd-card > * { position: relative; z-index: 1; }\n\n.dsd-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 13px;\n}\n\n.dsd-brand {\n  display: flex;\n  align-items: center;\n  gap: 7px;\n  font-size: 10px;\n  font-weight: 600;\n  letter-spacing: 0.17em;\n  color: rgba(255, 255, 255, 0.88);\n}\n\n.dsd-brand svg { width: 14px; height: 14px; opacity: 0.92; }\n\n.dsd-brand .dsd-sub {\n  color: var(--dsd-faint);\n  font-weight: 500;\n  letter-spacing: 0.13em;\n}\n\n.dsd-refresh {\n  width: 24px;\n  height: 24px;\n  display: grid;\n  place-items: center;\n  padding: 0;\n  border-radius: 8px;\n  border: 1px solid transparent;\n  background: transparent;\n  color: var(--dsd-dim);\n  cursor: pointer;\n  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;\n  -webkit-app-region: no-drag;\n}\n\n.dsd-refresh:hover {\n  background: rgba(255, 255, 255, 0.06);\n  border-color: rgba(255, 255, 255, 0.08);\n  color: #fff;\n}\n\n.dsd-refresh[data-busy=\"true\"] svg { animation: dsd-spin 0.9s linear infinite; }\n\n.dsd-label {\n  font-size: 9px;\n  font-weight: 500;\n  letter-spacing: 0.17em;\n  text-transform: uppercase;\n  color: var(--dsd-faint);\n}\n\n.dsd-amount {\n  display: flex;\n  align-items: baseline;\n  gap: 3px;\n  margin-top: 3px;\n  font-size: 36px;\n  font-weight: 250;\n  line-height: 1.08;\n  letter-spacing: -0.035em;\n  font-variant-numeric: tabular-nums;\n  color: #fff;\n  transition: color 0.3s ease;\n}\n\n.dsd-amount[data-level=\"warn\"] { color: var(--dsd-warn); }\n.dsd-amount[data-level=\"bad\"] { color: var(--dsd-bad); }\n\n.dsd-cny {\n  font-size: 15px;\n  font-weight: 400;\n  letter-spacing: 0;\n  color: var(--dsd-dim);\n  transform: translateY(-9px);\n}\n\n.dsd-meta {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-top: 7px;\n  font-size: 10px;\n  color: var(--dsd-faint);\n}\n\n.dsd-tag {\n  display: inline-flex;\n  align-items: center;\n  gap: 5px;\n  height: 18px;\n  padding: 0 7px;\n  border-radius: 999px;\n  border: 1px solid rgba(255, 255, 255, 0.08);\n  background: rgba(255, 255, 255, 0.055);\n  color: var(--dsd-dim);\n  font-size: 9px;\n  letter-spacing: 0.08em;\n}\n\n.dsd-tag i {\n  width: 4px;\n  height: 4px;\n  border-radius: 50%;\n  background: var(--dsd-ok);\n  box-shadow: 0 0 7px rgba(139, 226, 139, 0.6);\n}\n\n.dsd-tag[data-peak=\"true\"] i {\n  background: var(--dsd-warn);\n  box-shadow: 0 0 7px rgba(255, 179, 64, 0.6);\n}\n\n.dsd-rule {\n  height: 1px;\n  margin: 13px 0;\n  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.10), transparent);\n}\n\n.dsd-usage-grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;\n  gap: 6px;\n}\n\n.dsd-stat b {\n  display: block;\n  font-size: 14px;\n  font-weight: 500;\n  letter-spacing: -0.015em;\n  font-variant-numeric: tabular-nums;\n  color: rgba(255, 255, 255, 0.92);\n}\n\n.dsd-stat span {\n  display: block;\n  margin-top: 2px;\n  font-size: 9px;\n  letter-spacing: 0.07em;\n  color: var(--dsd-faint);\n}\n\n.dsd-costline {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  margin-top: 10px;\n  font-size: 10px;\n  color: var(--dsd-faint);\n}\n\n.dsd-costline b {\n  font-size: 12px;\n  font-weight: 500;\n  color: rgba(255, 255, 255, 0.86);\n  font-variant-numeric: tabular-nums;\n}\n\n.dsd-section-head {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  font-size: 11px;\n  color: var(--dsd-dim);\n}\n\n.dsd-section-head b {\n  font-weight: 500;\n  color: #fff;\n  font-variant-numeric: tabular-nums;\n}\n\n.dsd-progress {\n  height: 2px;\n  margin: 8px 0 9px;\n  border-radius: 2px;\n  background: rgba(255, 255, 255, 0.08);\n  overflow: hidden;\n}\n\n.dsd-progress i {\n  display: block;\n  height: 100%;\n  width: 0;\n  border-radius: inherit;\n  background: linear-gradient(90deg, rgba(255, 255, 255, 0.52), #fff);\n  box-shadow: 0 0 9px rgba(255, 255, 255, 0.34);\n  transition: width 0.7s cubic-bezier(0.16, 1, 0.3, 1);\n}\n\n.dsd-todos {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n  max-height: 154px;\n  overflow: auto;\n  overscroll-behavior: contain;\n  scrollbar-width: thin;\n  scrollbar-color: rgba(255, 255, 255, 0.18) transparent;\n}\n\n.dsd-todos::-webkit-scrollbar { width: 4px; }\n.dsd-todos::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.16); border-radius: 4px; }\n\n.dsd-todos li {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 4px 0;\n  font-size: 11px;\n  line-height: 1.42;\n  color: var(--dsd-dim);\n}\n\n.dsd-todos li[data-status=\"completed\"] { color: var(--dsd-faint); }\n.dsd-todos li[data-status=\"in_progress\"] { color: #fff; }\n\n.dsd-todos li[data-status=\"completed\"] .dsd-todo-text {\n  text-decoration: line-through;\n  text-decoration-color: rgba(255, 255, 255, 0.24);\n}\n\n.dsd-check {\n  flex: 0 0 13px;\n  width: 13px;\n  height: 13px;\n  margin-top: 1px;\n  display: grid;\n  place-items: center;\n  border-radius: 50%;\n  border: 1px solid rgba(255, 255, 255, 0.22);\n  color: transparent;\n  transition: background 0.25s ease, border-color 0.25s ease;\n}\n\n.dsd-todos li[data-status=\"completed\"] .dsd-check {\n  background: #f5f5f7;\n  border-color: #f5f5f7;\n  color: #0a0a0c;\n}\n\n.dsd-todos li[data-status=\"in_progress\"] .dsd-check {\n  border-color: rgba(255, 255, 255, 0.72);\n}\n\n.dsd-todos li[data-status=\"in_progress\"] .dsd-check::after {\n  content: \"\";\n  width: 5px;\n  height: 5px;\n  border-radius: 50%;\n  background: #fff;\n  box-shadow: 0 0 9px rgba(255, 255, 255, 0.85);\n  animation: dsd-pulse 1.6s ease-in-out infinite;\n}\n\n.dsd-empty {\n  padding: 8px 0 4px;\n  font-size: 10px;\n  line-height: 1.55;\n  color: var(--dsd-faint);\n}\n\n.dsd-empty b { display: block; font-weight: 500; color: var(--dsd-dim); }\n\n.dsd-goal {\n  display: flex;\n  align-items: baseline;\n  justify-content: space-between;\n  gap: 10px;\n  margin-top: 10px;\n  padding-top: 10px;\n  border-top: 1px solid rgba(255, 255, 255, 0.06);\n  font-size: 10px;\n  color: var(--dsd-faint);\n}\n\n.dsd-goal span {\n  min-width: 0;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n\n.dsd-goal b {\n  flex: 0 0 auto;\n  font-weight: 500;\n  color: var(--dsd-dim);\n  font-variant-numeric: tabular-nums;\n}\n\n.dsd-foot {\n  display: flex;\n  justify-content: space-between;\n  gap: 10px;\n  margin-top: 12px;\n  font-size: 9px;\n  letter-spacing: 0.03em;\n  color: rgba(245, 245, 247, 0.24);\n}\n\n.dsd-foot .dsd-err { color: var(--dsd-bad); }\n\n.dsd-orb-wrap {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  pointer-events: auto;\n}\n\n.dsd-orb {\n  position: relative;\n  width: 56px;\n  height: 56px;\n  display: grid;\n  place-items: center;\n  padding: 0;\n  border-radius: 50%;\n  border: 1px solid rgba(255, 255, 255, 0.16);\n  background:\n    radial-gradient(80% 80% at 32% 22%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.05) 42%, rgba(0, 0, 0, 0.55) 100%),\n    linear-gradient(160deg, rgba(32, 32, 36, 0.86), rgba(5, 5, 7, 0.94));\n  box-shadow:\n    0 12px 40px rgba(0, 0, 0, 0.56),\n    inset 0 1px 1px rgba(255, 255, 255, 0.42),\n    inset 0 -9px 18px rgba(0, 0, 0, 0.40);\n  backdrop-filter: blur(20px) saturate(165%);\n  -webkit-backdrop-filter: blur(20px) saturate(165%);\n  cursor: pointer;\n  -webkit-app-region: no-drag;\n  transition:\n    transform 0.36s cubic-bezier(0.16, 1, 0.3, 1),\n    box-shadow 0.36s ease,\n    border-color 0.36s ease;\n}\n\n.dsd-orb:hover {\n  transform: translateY(-2px) scale(1.045);\n  border-color: rgba(255, 255, 255, 0.30);\n  box-shadow:\n    0 17px 52px rgba(0, 0, 0, 0.62),\n    inset 0 1px 1px rgba(255, 255, 255, 0.55),\n    inset 0 -9px 18px rgba(0, 0, 0, 0.40);\n}\n\n.dsd-orb:active { transform: scale(0.955); }\n.dsd-orb:focus-visible { outline: 2px solid rgba(255, 255, 255, 0.55); outline-offset: 3px; }\n\n.dsd-logo {\n  position: relative;\n  z-index: 2;\n  width: 31px;\n  height: 31px;\n  color: #fff;\n  filter: drop-shadow(0 1px 7px rgba(0, 0, 0, 0.55));\n}\n\n.dsd-orb::after {\n  content: \"\";\n  position: absolute;\n  inset: 0;\n  z-index: 1;\n  border-radius: 50%;\n  pointer-events: none;\n  background: linear-gradient(145deg, rgba(255, 255, 255, 0.20), transparent 34%, transparent 70%, rgba(255, 255, 255, 0.04));\n  mix-blend-mode: screen;\n}\n\n.dsd-ring {\n  position: absolute;\n  z-index: 2;\n  inset: -4px;\n  width: 64px;\n  height: 64px;\n  overflow: visible;\n  transform: rotate(-90deg);\n  pointer-events: none;\n}\n\n.dsd-ring circle { fill: none; stroke-width: 2.4; }\n\n.dsd-ring .track { stroke: rgba(255, 255, 255, 0.14); }\n\n.dsd-ring .fill {\n  stroke: url(#dsd-ring-gradient);\n  stroke-linecap: round;\n  opacity: 1;\n  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.5));\n  transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;\n}\n\n.dsd-root[data-progress=\"none\"] .dsd-ring .fill { opacity: 0; }\n.dsd-root[data-progress=\"none\"] .dsd-ring .track {\n  stroke-dasharray: 2 6;\n  opacity: 0.75;\n  animation: dsd-breathe 3.2s ease-in-out infinite;\n}\n\n.dsd-chip {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  height: 22px;\n  padding: 0 9px;\n  border-radius: 999px;\n  border: 1px solid rgba(255, 255, 255, 0.10);\n  background: linear-gradient(180deg, rgba(28, 28, 32, 0.88), rgba(8, 8, 10, 0.92));\n  box-shadow: 0 7px 22px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.14);\n  backdrop-filter: blur(16px) saturate(160%);\n  -webkit-backdrop-filter: blur(16px) saturate(160%);\n  color: rgba(255, 255, 255, 0.78);\n  font-size: 10px;\n  font-variant-numeric: tabular-nums;\n  letter-spacing: 0.02em;\n  cursor: pointer;\n  -webkit-app-region: no-drag;\n  transition: border-color 0.25s ease, color 0.25s ease;\n}\n\n.dsd-chip:hover { border-color: rgba(255, 255, 255, 0.20); color: #fff; }\n.dsd-chip[data-low=\"true\"] { color: var(--dsd-warn); }\n\n.dsd-chip-sep {\n  width: 1px;\n  height: 9px;\n  background: rgba(255, 255, 255, 0.14);\n  max-width: 0;\n  opacity: 0;\n  overflow: hidden;\n  transition: max-width 0.3s ease, opacity 0.25s ease;\n}\n\n.dsd-chip-task {\n  max-width: 0;\n  opacity: 0;\n  overflow: hidden;\n  white-space: nowrap;\n  color: var(--dsd-faint);\n  transition: max-width 0.34s ease, opacity 0.26s ease;\n}\n\n.dsd-root[data-open=\"true\"] .dsd-chip-sep,\n.dsd-root:hover .dsd-chip-sep { max-width: 1px; opacity: 1; }\n\n.dsd-root[data-open=\"true\"] .dsd-chip-task,\n.dsd-root:hover .dsd-chip-task { max-width: 64px; opacity: 1; }\n\n@keyframes dsd-drift {\n  from { transform: translate3d(-5%, -4%, 0) rotate(0deg); }\n  to { transform: translate3d(5%, 4%, 0) rotate(11deg); }\n}\n\n@keyframes dsd-pulse {\n  0%, 100% { opacity: 0.35; transform: scale(0.78); }\n  50% { opacity: 1; transform: scale(1); }\n}\n\n@keyframes dsd-spin { to { transform: rotate(360deg); } }\n\n@keyframes dsd-breathe {\n  0%, 100% { opacity: 0.35; }\n  50% { opacity: 0.8; }\n}\n\n@media (max-width: 640px) {\n  .dsd-root { right: 10px; bottom: 10px; }\n  .dsd-card { width: min(300px, calc(100vw - 20px)); }\n  .dsd-orb { width: 48px; height: 48px; }\n  .dsd-logo { width: 27px; height: 27px; }\n  .dsd-ring { width: 56px; height: 56px; inset: -4px; }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .dsd-card, .dsd-orb, .dsd-chip, .dsd-progress i, .dsd-ring .fill, .dsd-chip-sep, .dsd-chip-task {\n    transition: none !important;\n  }\n  .dsd-aurora,\n  .dsd-todos li[data-status=\"in_progress\"] .dsd-check::after,\n  .dsd-root[data-progress=\"none\"] .dsd-ring .track { animation: none !important; }\n}";
    var WHALE = "<path d=\"M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z\" fill=\"currentColor\" fill-opacity=\"1.000000\" fill-rule=\"nonzero\"/>";
    var STYLE_ID = 'dsh-deepseek-dock-style';
    var API = '/api/deepseek-dock/state';
    var RING_R = 29;
    var RING_C = 2 * Math.PI * RING_R;

    var FALLBACK_RATES = {
      peak: { inputMiss: 2.0, inputHit: 0.04, output: 8.0 },
      offPeak: { inputMiss: 1.0, inputHit: 0.02, output: 4.0 }
    };

    var ZH = {
      balance: '账户余额',
      session: '本会话',
      input: '输入',
      output: '输出',
      cache: '缓存命中',
      task: '任务',
      noTask: '暂无任务清单',
      noTaskHint: '智能体开始多步任务时，会在这里显示完成进度',
      goal: '目标',
      rounds: '轮次',
      peak: '峰时',
      offpeak: '谷时',
      refresh: '刷新余额',
      open: '打开 DeepSeek 状态',
      close: '收起 DeepSeek 状态',
      estimated: '估算值，以官方账单为准',
      balanceError: '余额暂时读不到',
      loading: '正在读取余额',
      sourceAccount: '已登录账户',
      sourceKey: '官方接口',
      stale: '上次余额',
      justNow: '刚刚更新',
      minutesAgo: '{n} 分钟前',
      hoursAgo: '{n} 小时前',
      noBalance: '未登录账户且未配置 API Key'
    };

    var EN = {
      balance: 'Account balance',
      session: 'This session',
      input: 'Input',
      output: 'Output',
      cache: 'Cache hit',
      task: 'Tasks',
      noTask: 'No task list yet',
      noTaskHint: 'A checklist appears here when the agent starts multi-step work',
      goal: 'Goal',
      rounds: 'Round',
      peak: 'Peak',
      offpeak: 'Off-peak',
      refresh: 'Refresh balance',
      open: 'Open DeepSeek status',
      close: 'Collapse DeepSeek status',
      estimated: 'Estimate only; official billing wins',
      balanceError: 'Balance unavailable',
      loading: 'Reading balance',
      sourceAccount: 'Account',
      sourceKey: 'API key',
      stale: 'Last balance',
      justNow: 'just now',
      minutesAgo: '{n} min ago',
      hoursAgo: '{n} h ago',
      noBalance: 'No signed-in account or API key'
    };

    var L = /^zh/i.test(navigator.language || '') ? ZH : EN;

    function text(key, params) {
      var raw = L[key] == null ? key : L[key];
      if (params == null) return raw;
      return String(raw).replace(/\{(\w+)\}/g, function (_match, name) {
        return params[name] == null ? '' : String(params[name]);
      });
    }

    function ensureStyle() {
      if (document.getElementById(STYLE_ID) !== null) return;
      var style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = CSS;
      (document.head || document.documentElement).appendChild(style);
    }

    function formatTokens(value) {
      var n = Number(value);
      if (!Number.isFinite(n) || n <= 0) return '0';
      if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1) + 'B';
      if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + 'K';
      return String(Math.round(n));
    }

    function formatExact(value) {
      var n = Number(value);
      if (!Number.isFinite(n)) return '0';
      try { return n.toLocaleString('zh-CN'); }
      catch (error) { return String(Math.round(n)); }
    }

    function formatMoney(value) {
      var n = Number(value);
      if (!Number.isFinite(n)) return '—';
      try {
        return n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } catch (error) {
        return n.toFixed(2);
      }
    }

    function agoLabel(timestamp, now) {
      if (timestamp == null || timestamp <= 0) return '';
      var seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
      if (seconds < 45) return text('justNow');
      var minutes = Math.floor(seconds / 60);
      if (minutes < 60) return text('minutesAgo', { n: minutes });
      return text('hoursAgo', { n: Math.floor(minutes / 60) });
    }

    function costOf(totals, rate) {
      var uncached = Number(totals && totals.uncachedInputTokens) || 0;
      var cacheRead = Number(totals && totals.cacheReadTokens) || 0;
      var cacheWrite = Number(totals && totals.cacheWriteTokens) || 0;
      var output = Number(totals && totals.outputTokens) || 0;
      return (uncached * rate.inputMiss + cacheRead * rate.inputHit + (cacheWrite + output) * rate.output) / 1e6;
    }

    function costLabel(cost) {
      if (!Number.isFinite(cost) || cost <= 0) return '¥0.00';
      if (cost < 0.01) return '¥<0.01';
      if (cost >= 100) return '¥' + cost.toFixed(0);
      return '¥' + cost.toFixed(2);
    }

    function pctLabel(value) {
      if (!Number.isFinite(value) || value <= 0) return '—';
      return Math.round(value * 100) + '%';
    }

    function useTicker(intervalMs) {
      var state = React.useState(Date.now());
      var now = state[0];
      var setNow = state[1];
      React.useEffect(function () {
        var id = setInterval(function () { setNow(Date.now()); }, intervalMs);
        return function () { clearInterval(id); };
      }, [intervalMs]);
      return now;
    }

    function useHostState(sessionId, open) {
      var state = React.useState(null);
      var host = state[0];
      var setHost = state[1];
      var loadingState = React.useState(true);
      var loading = loadingState[0];
      var setLoading = loadingState[1];
      var errorState = React.useState(null);
      var error = errorState[0];
      var setError = errorState[1];
      var timeState = React.useState(0);
      var fetchedAt = timeState[0];
      var setFetchedAt = timeState[1];
      var seq = React.useRef(0);

      var load = React.useCallback(function (force) {
        var mine = seq.current + 1;
        seq.current = mine;
        setLoading(true);
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 9000);
        var url = API + '?session=' + encodeURIComponent(sessionId || '') + (force ? '&refresh=1' : '');
        fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } })
          .then(function (response) {
            return response.json().catch(function () { return null; }).then(function (data) {
              if (!response.ok || data == null || data.ok === false) {
                throw new Error((data && data.error) || ('HTTP ' + response.status));
              }
              return data;
            });
          })
          .then(function (data) {
            if (seq.current !== mine) return;
            setHost(data);
            setError(null);
            setFetchedAt(Date.now());
          })
          .catch(function (reason) {
            if (seq.current !== mine) return;
            if (reason && reason.name === 'AbortError') setError('timeout');
            else setError(String((reason && reason.message) || reason));
          })
          .finally(function () {
            clearTimeout(timer);
            if (seq.current === mine) setLoading(false);
          });
      }, [sessionId]);

      React.useEffect(function () {
        load(false);
      }, [load]);

      React.useEffect(function () {
        var id = setInterval(function () { load(false); }, open ? 30000 : 60000);
        return function () { clearInterval(id); };
      }, [load, open]);

      return { host: host, loading: loading, error: error, fetchedAt: fetchedAt, refresh: function () { load(true); } };
    }

    function Stat(props) {
      return h('div', { className: 'dsd-stat' },
        h('b', null, props.value),
        h('span', null, props.label)
      );
    }

    function CheckMark() {
      return h('svg', {
        width: 8,
        height: 8,
        viewBox: '0 0 10 10',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.9,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true
      }, h('path', { d: 'M1.4 5.2 4 7.7 8.7 2.2' }));
    }

    function TodoRow(props) {
      return h('li', { 'data-status': props.item.status },
        h('span', { className: 'dsd-check', 'aria-hidden': true }, props.item.status === 'completed' ? h(CheckMark) : null),
        h('span', { className: 'dsd-todo-text' }, props.item.content)
      );
    }

    function Dock(props) {
      var sessionId = props.sessionId;
      var useProjection = props.useProjection;
      var todos = useProjection('todos');
      var usage = useProjection('tokenUsage');
      var goalProjection = useProjection('goal');
      var stats = useProjection('sessionStats');

      var openState = React.useState(false);
      var open = openState[0];
      var setOpen = openState[1];
      var rootRef = React.useRef(null);
      var cardRef = React.useRef(null);
      var remote = useHostState(sessionId, open);
      var host = remote.host;
      var now = useTicker(15000);

      React.useEffect(function () {
        if (!open) return undefined;
        function onPointerDown(event) {
          if (rootRef.current !== null && !rootRef.current.contains(event.target)) setOpen(false);
        }
        function onKeyDown(event) {
          if (event.key === 'Escape') setOpen(false);
        }
        document.addEventListener('pointerdown', onPointerDown, true);
        document.addEventListener('keydown', onKeyDown, true);
        return function () {
          document.removeEventListener('pointerdown', onPointerDown, true);
          document.removeEventListener('keydown', onKeyDown, true);
        };
      }, [open]);

      function onCardMove(event) {
        var card = cardRef.current;
        if (card === null) return;
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', (event.clientX - rect.left) + 'px');
        card.style.setProperty('--my', (event.clientY - rect.top) + 'px');
      }

      function onCardLeave() {
        var card = cardRef.current;
        if (card === null) return;
        card.style.setProperty('--mx', '72%');
        card.style.setProperty('--my', '0%');
      }

      var items = Array.isArray(todos) ? todos : [];
      var total = items.length;
      var done = 0;
      var inProgress = 0;
      for (var i = 0; i < items.length; i += 1) {
        if (items[i].status === 'completed') done += 1;
        else if (items[i].status === 'in_progress') inProgress += 1;
      }
      var ratio = total > 0 ? done / total : 0;
      var ringOffset = RING_C * (1 - ratio);

      var usageReady = usage != null;
      var totals = usage && usage.totals ? usage.totals : (usage || {});
      var uncached = Number(totals.uncachedInputTokens) || 0;
      var cacheRead = Number(totals.cacheReadTokens) || 0;
      var cacheWrite = Number(totals.cacheWriteTokens) || 0;
      var output = Number(totals.outputTokens) || 0;
      var inputTotal = uncached + cacheRead + cacheWrite;
      var tokenTotal = inputTotal + output;
      var cacheRatio = inputTotal > 0 ? cacheRead / inputTotal : 0;

      var ratesRoot = (host && host.rates) || {};
      var flash = ratesRoot.flash || FALLBACK_RATES;
      var peak = !!(host && host.peak);
      var rate = peak ? (flash.peak || FALLBACK_RATES.peak) : (flash.offPeak || FALLBACK_RATES.offPeak);
      var cost = costOf(totals, rate);

      var balance = host ? host.balance : null;
      var balanceValue = balance ? Number(balance.total) : null;
      var lowThreshold = host && typeof host.lowThreshold === 'number' ? host.lowThreshold : 5;
      var criticalThreshold = host && typeof host.criticalThreshold === 'number' ? host.criticalThreshold : 1;
      var level = balanceValue === null || !Number.isFinite(balanceValue)
        ? 'none'
        : (balanceValue < criticalThreshold ? 'bad' : (balanceValue < lowThreshold ? 'warn' : 'ok'));
      var currency = balance && balance.currency === 'USD' ? '$' : '¥';
      var balanceText = balance ? formatMoney(balance.total) : '—';
      var balanceSource = balance
        ? (balance.source === 'account' ? text('sourceAccount') : text('sourceKey'))
        : (remote.loading ? text('loading') : text('noBalance'));

      var goalView = goalProjection && goalProjection.goal ? goalProjection : null;
      var goalVisible = goalView !== null && goalView.goal.phase !== 'complete';
      var goalRounds = goalView ? Number(goalView.roundsStarted) || 0 : 0;
      var goalMax = goalView ? Number(goalView.goal.maxGoalRounds) || 0 : 0;

      var cardClassName = 'dsd-card';
      var rootClassName = 'dsd-root';
      var progressState = total > 0 ? 'pct' : 'none';

      var refreshLabel = remote.loading ? text('loading') : text('refresh');
      var errorText = remote.error ? text('balanceError') : text('estimated');
      var updatedText = remote.error ? '' : agoLabel(remote.fetchedAt, now);

      return ReactDOM.createPortal(
        h('div', {
          className: rootClassName,
          ref: rootRef,
          'data-open': open ? 'true' : 'false',
          'data-progress': progressState,
          'data-low': level === 'warn' || level === 'bad' ? 'true' : 'false'
        },
          h('div', {
            className: cardClassName,
            ref: cardRef,
            role: 'dialog',
            'aria-label': 'DeepSeek status',
            'aria-hidden': open ? 'false' : 'true',
            onPointerMove: onCardMove,
            onPointerLeave: onCardLeave
          },
            h('div', { className: 'dsd-aurora', 'aria-hidden': true }),
            h('div', { className: 'dsd-head' },
              h('div', { className: 'dsd-brand' },
                h('svg', { viewBox: '0 0 50 50', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: WHALE } }),
                h('span', null, 'DEEPSEEK'),
                h('span', { className: 'dsd-sub' }, 'DOCK')
              ),
              h('button', {
                type: 'button',
                className: 'dsd-refresh',
                title: refreshLabel,
                'aria-label': refreshLabel,
                'data-busy': remote.loading ? 'true' : 'false',
                onClick: function () { remote.refresh(); }
              },
                h('svg', {
                  width: 13,
                  height: 13,
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  strokeWidth: 1.7,
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  'aria-hidden': true
                },
                  h('path', { d: 'M20.5 12a8.5 8.5 0 1 1-2.5-6' }),
                  h('path', { d: 'M20.5 3.5V9H15' })
                )
              )
            ),
            h('div', { className: 'dsd-label' }, text('balance')),
            h('div', { className: 'dsd-amount', 'data-level': level },
              h('span', { className: 'dsd-cny' }, currency),
              h('span', null, balanceText)
            ),
            h('div', { className: 'dsd-meta' },
              h('span', { className: 'dsd-tag', 'data-peak': peak ? 'true' : 'false' },
                h('i', { 'aria-hidden': true }),
                peak ? text('peak') : text('offpeak')
              ),
              h('span', null, balance && host && host.stale ? text('stale') : balanceSource)
            ),
            h('div', { className: 'dsd-rule' }),
            h('div', { className: 'dsd-usage-grid' },
              h(Stat, { label: text('input'), value: usageReady ? formatTokens(inputTotal) : '—' }),
              h(Stat, { label: text('output'), value: usageReady ? formatTokens(output) : '—' }),
              h(Stat, { label: text('cache'), value: usageReady ? pctLabel(cacheRatio) : '—' })
            ),
            h('div', { className: 'dsd-costline' },
              h('span', null, text('session') + ' · ' + (usageReady ? formatTokens(tokenTotal) + ' tokens' : '—')),
              h('b', null, usageReady ? '≈ ' + costLabel(cost) : '≈ —')
            ),
            h('div', { className: 'dsd-rule' }),
            h('div', { className: 'dsd-section-head' },
              h('span', null, text('task')),
              h('b', null, total > 0 ? done + '/' + total : '—')
            ),
            h('div', { className: 'dsd-progress' },
              h('i', { style: { width: (ratio * 100).toFixed(1) + '%' } })
            ),
            total > 0
              ? h('ul', { className: 'dsd-todos' }, items.map(function (item, index) {
                  return h(TodoRow, { key: index, item: item });
                }))
              : h('div', { className: 'dsd-empty' },
                  h('b', null, text('noTask')),
                  h('span', null, text('noTaskHint'))
                ),
            goalVisible
              ? h('div', { className: 'dsd-goal' },
                  h('span', null, text('goal') + ' · ' + String(goalView.goal.objective || '')),
                  h('b', null, text('rounds') + ' ' + goalRounds + (goalMax > 0 ? '/' + goalMax : ''))
                )
              : null,
            h('div', { className: 'dsd-foot' },
              h('span', { className: remote.error ? 'dsd-err' : '' }, errorText),
              h('span', null, updatedText)
            )
          ),
          h('div', { className: 'dsd-orb-wrap' },
            h('button', {
              type: 'button',
              className: 'dsd-orb',
              onClick: function () { setOpen(function (value) { return !value; }); },
              'aria-expanded': open,
              'aria-label': open ? text('close') : text('open')
            },
              h('svg', { className: 'dsd-ring', viewBox: '0 0 64 64', 'aria-hidden': true },
                h('defs', null,
                  h('linearGradient', { id: 'dsd-ring-gradient', x1: '0', y1: '0', x2: '1', y2: '1' },
                    h('stop', { offset: '0%', stopColor: '#ffffff' }),
                    h('stop', { offset: '100%', stopColor: '#8f949c' })
                  )
                ),
                h('circle', { className: 'track', cx: 32, cy: 32, r: RING_R }),
                h('circle', {
                  className: 'fill',
                  cx: 32,
                  cy: 32,
                  r: RING_R,
                  strokeDasharray: RING_C.toFixed(2),
                  strokeDashoffset: ringOffset.toFixed(2)
                })
              ),
              h('svg', { className: 'dsd-logo', viewBox: '0 0 50 50', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: WHALE } })
            ),
            h('button', {
              type: 'button',
              className: 'dsd-chip',
              onClick: function () { setOpen(function (value) { return !value; }); },
              'data-low': level === 'warn' || level === 'bad' ? 'true' : 'false',
              'aria-label': open ? text('close') : text('open')
            },
              h('span', null, balance ? currency + balanceText : currency + '—'),
              h('span', { className: 'dsd-chip-sep', 'aria-hidden': true }),
              h('span', { className: 'dsd-chip-task' }, total > 0 ? done + '/' + total : (inProgress > 0 ? '…' : '0/0'))
            )
          )
        ),
        document.body
      );
    }

    function apply(ctx) {
      ensureStyle();
      ctx.slots.inject('conversation.input.dock', function () {
        return ctx.slots.register({
          name: 'conversation.input.dock',
          id: 'deepseek-dock',
          order: 90
        }, Dock);
      });
    }

    exports.apply = apply;
    exports.inject = ['slots'];
    return module.exports;
  }
});
