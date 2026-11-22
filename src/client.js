window.__ModuleLoader__.load({
  id: 'dsh-deepseek-dock',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    var React = require('react');
    var ReactDOM = require('react-dom');
    var h = React.createElement;

    var CSS = __CSS__;
    var WHALE = __WHALE__;
    var STYLE_ID = 'dsh-deepseek-dock-style';
    var API = '/api/deepseek-dock/state';

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

      var openState = React.useState(false);
      var open = openState[0];
      var setOpen = openState[1];
      var rootRef = React.useRef(null);
      var snapshotRef = React.useRef('');
      var remote = useHostState(sessionId, open);
      var host = remote.host;
      var now = useTicker(15000);

      React.useEffect(function () {
        var payload = {
          sessionId: sessionId,
          todos: Array.isArray(todos) ? todos : null,
          tokenUsage: usage || null,
          goal: goalProjection && goalProjection.goal
            ? {
                objective: goalProjection.goal.objective,
                phase: goalProjection.goal.phase,
                roundsStarted: goalProjection.roundsStarted || 0,
                maxGoalRounds: goalProjection.goal.maxGoalRounds || 0
              }
            : null
        };
        var key = JSON.stringify(payload);
        if (key === snapshotRef.current) return undefined;
        snapshotRef.current = key;
        var controller = new AbortController();
        var timer = setTimeout(function () { controller.abort(); }, 4000);
        fetch('/api/deepseek-dock/snapshot', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal
        }).catch(function () {}).finally(function () { clearTimeout(timer); });
        return function () {
          clearTimeout(timer);
          controller.abort();
        };
      }, [sessionId, todos, usage, goalProjection]);

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

      var items = Array.isArray(todos) ? todos : [];
      var total = items.length;
      var done = 0;
      for (var i = 0; i < items.length; i += 1) {
        if (items[i].status === 'completed') done += 1;
      }
      var ratio = total > 0 ? done / total : 0;

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

      var progressState = total > 0 ? 'pct' : 'none';

      var refreshLabel = remote.loading ? text('loading') : text('refresh');
      var errorText = remote.error ? text('balanceError') : text('estimated');
      var updatedText = remote.error ? '' : agoLabel(remote.fetchedAt, now);

      return ReactDOM.createPortal(
        h('div', {
          className: 'dsd-root',
          ref: rootRef,
          'data-open': open ? 'true' : 'false',
          'data-progress': progressState,
          'data-low': level === 'warn' || level === 'bad' ? 'true' : 'false'
        },
          h('div', {
            className: 'dsd-card',
            role: 'dialog',
            'aria-label': 'DeepSeek status',
            'aria-hidden': open ? 'false' : 'true'
          },
            h('div', { className: 'dsd-head' },
              h('div', { className: 'dsd-brand' },
                h('svg', { viewBox: '0 0 50 50', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: WHALE } }),
                h('span', null, 'DeepSeek')
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
            total > 0
              ? h('div', { className: 'dsd-progress' },
                  h('i', { style: { width: (ratio * 100).toFixed(1) + '%' } })
                )
              : null,
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
          h('div', { className: 'dsd-tile-wrap' },
            h('button', {
              type: 'button',
              className: 'dsd-tile',
              onClick: function () { setOpen(function (value) { return !value; }); },
              'aria-expanded': open,
              'aria-label': open ? text('close') : text('open')
            },
              h('svg', { className: 'dsd-logo', viewBox: '0 0 50 50', 'aria-hidden': true, dangerouslySetInnerHTML: { __html: WHALE } }),
              h('span', { className: 'dsd-tile-bar', 'aria-hidden': true },
                h('i', { style: { width: (ratio * 100).toFixed(1) + '%' } })
              )
            ),
            h('button', {
              type: 'button',
              className: 'dsd-caption',
              onClick: function () { setOpen(function (value) { return !value; }); },
              'data-low': level === 'warn' || level === 'bad' ? 'true' : 'false',
              'aria-label': open ? text('close') : text('open')
            },
              h('span', { className: 'dsd-caption-money' }, balance ? currency + balanceText : currency + '—'),
              h('span', { className: 'dsd-caption-sep', 'aria-hidden': true }, '·'),
              h('span', { className: 'dsd-caption-task' }, total > 0 ? done + '/' + total : '')
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
