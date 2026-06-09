<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Azure Observability Demo</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:       #0d1117;
      --surface:  #161b22;
      --border:   #30363d;
      --accent:   #58a6ff;
      --green:    #3fb950;
      --yellow:   #d29922;
      --red:      #f85149;
      --muted:    #8b949e;
      --text:     #e6edf3;
      --mono:     "JetBrains Mono", "Fira Code", monospace;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      padding: 2rem 1rem;
    }

    header {
      max-width: 800px;
      margin: 0 auto 2.5rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1.5rem;
    }

    header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text);
    }

    header h1 span { color: var(--accent); }

    header p {
      margin-top: 0.4rem;
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    main {
      max-width: 800px;
      margin: 0 auto;
      display: grid;
      gap: 1rem;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .badge {
      font-family: var(--mono);
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    .badge-get    { background: #1b3a5e; color: var(--accent); }
    .badge-post   { background: #2d3b1b; color: var(--green); }
    .badge-green  { background: #1b3d2b; color: var(--green); }
    .badge-yellow { background: #3d3010; color: var(--yellow); }
    .badge-red    { background: #3d1b1b; color: var(--red); }

    .card h2 {
      font-size: 0.95rem;
      font-weight: 600;
    }

    .card p {
      font-size: 0.85rem;
      color: var(--muted);
      margin-bottom: 1rem;
      line-height: 1.5;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    button {
      background: #21262d;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.45rem 1rem;
      border-radius: 6px;
      font-size: 0.85rem;
      cursor: pointer;
      font-family: inherit;
      transition: background 0.15s, border-color 0.15s;
    }

    button:hover { background: #2d333b; border-color: #8b949e; }
    button:active { transform: scale(0.98); }

    button.primary {
      background: #1f6feb;
      border-color: #388bfd;
      color: #fff;
    }
    button.primary:hover { background: #388bfd; }

    input[type="number"] {
      width: 90px;
      background: #0d1117;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      font-family: var(--mono);
      font-size: 0.85rem;
    }

    .result-box {
      margin-top: 0.85rem;
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem 1rem;
      font-family: var(--mono);
      font-size: 0.8rem;
      line-height: 1.6;
      min-height: 2.5rem;
      white-space: pre-wrap;
      word-break: break-all;
      color: var(--muted);
    }

    .result-box.ok    { border-left: 3px solid var(--green);  color: var(--green); }
    .result-box.error { border-left: 3px solid var(--red);    color: var(--red); }
    .result-box.info  { border-left: 3px solid var(--yellow); color: var(--yellow); }
    .result-box.loading { color: var(--muted); font-style: italic; }

    .section-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: var(--muted);
      margin: 1.5rem 0 0.5rem;
    }

    footer {
      max-width: 800px;
      margin: 2.5rem auto 0;
      border-top: 1px solid var(--border);
      padding-top: 1rem;
      font-size: 0.8rem;
      color: var(--muted);
    }

    footer a { color: var(--accent); text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>

<header>
  <h1>Azure Observability <span>Demo App</span></h1>
  <p>Trigger different behaviours and watch them appear in Azure Monitor, Log Analytics, and Application Insights.<br>
     Each button below generates specific telemetry you can query and alert on.</p>
</header>

<main>

  <p class="section-label">Request patterns</p>

  <!-- Fast -->
  <div class="card">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="badge badge-green">200</span>
      <h2>/api/fast</h2>
    </div>
    <p>Returns immediately. Produces a low-latency entry in the <code>requests</code> table and a <em>FastEndpointCalled</em> custom event.</p>
    <div class="card-actions">
      <button class="primary" onclick="callApi('/api/fast', 'fast-result')">Call /api/fast</button>
      <button onclick="repeatCall('/api/fast', 'fast-result', 10)">Call ×10</button>
    </div>
    <div class="result-box" id="fast-result">—</div>
  </div>

  <!-- Slow -->
  <div class="card">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="badge badge-yellow">SLOW</span>
      <h2>/api/slow</h2>
    </div>
    <p>Sleeps for the given number of milliseconds before responding. Great for experimenting with <strong>performance alerts</strong> and the <em>duration</em> field in the requests table.</p>
    <div class="card-actions">
      <input type="number" id="slow-ms" value="3000" min="100" max="30000" step="500" />
      <button class="primary" onclick="callSlowApi()">Call /api/slow</button>
    </div>
    <div class="result-box" id="slow-result">—</div>
  </div>

  <p class="section-label">Error scenarios</p>

  <!-- 500 error -->
  <div class="card">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="badge badge-red">500</span>
      <h2>/api/error</h2>
    </div>
    <p>Returns a 500 response and tracks an explicit exception. Look for it in the <strong>exceptions</strong> table and as a failed request in <strong>requests</strong>.</p>
    <div class="card-actions">
      <button class="primary" onclick="callApi('/api/error', 'error-result')">Trigger 500</button>
      <button onclick="repeatCall('/api/error', 'error-result', 5)">Trigger ×5</button>
    </div>
    <div class="result-box" id="error-result">—</div>
  </div>

  <!-- Crash -->
  <div class="card">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="badge badge-red">CRASH</span>
      <h2>/api/crash</h2>
    </div>
    <p>Throws an unhandled exception caught by Express's error middleware. Produces an entry in <strong>exceptions</strong> with a full stack trace.</p>
    <div class="card-actions">
      <button class="primary" onclick="callApi('/api/crash', 'crash-result')">Trigger crash</button>
    </div>
    <div class="result-box" id="crash-result">—</div>
  </div>

  <p class="section-label">Custom telemetry</p>

  <!-- Custom events -->
  <div class="card">
    <div class="card-header">
      <span class="badge badge-post">POST</span>
      <span class="badge badge-green">EVENT</span>
      <h2>/api/track-click</h2>
    </div>
    <p>Sends a named <strong>ButtonClicked</strong> custom event and a <strong>ButtonPressCount</strong> custom metric to App Insights. Query in <code>customEvents</code> and <code>customMetrics</code>.</p>
    <div class="card-actions">
      <button onclick="trackClick('Save')">Save</button>
      <button onclick="trackClick('Delete')">Delete</button>
      <button onclick="trackClick('Export')">Export</button>
      <button onclick="trackClick('Share')">Share</button>
    </div>
    <div class="result-box" id="click-result">—</div>
  </div>

  <!-- External dependency -->
  <div class="card">
    <div class="card-header">
      <span class="badge badge-get">GET</span>
      <span class="badge badge-green">DEP</span>
      <h2>/api/external</h2>
    </div>
    <p>Makes an outbound HTTPS call to <strong>httpbin.org</strong>. App Insights auto-tracks this as a <em>dependency</em> — visible in the <strong>dependencies</strong> table and the Application Map.</p>
    <div class="card-actions">
      <button class="primary" onclick="callApi('/api/external', 'external-result')">Call external API</button>
    </div>
    <div class="result-box" id="external-result">—</div>
  </div>

</main>

<footer>
  <p>
    Each call generates telemetry in Azure Application Insights. 
    Query it with <a href="https://learn.microsoft.com/en-us/azure/azure-monitor/logs/log-analytics-tutorial" target="_blank">KQL in Log Analytics</a> 
    or view it in the <a href="https://learn.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview" target="_blank">Application Insights portal</a>.
  </p>
</footer>

<script>
  async function callApi(url, resultId, label = null) {
    const box = document.getElementById(resultId);
    box.className = "result-box loading";
    box.textContent = "Calling " + url + "…";
    const t0 = Date.now();
    try {
      const res = await fetch(url);
      const data = await res.json();
      const ms = Date.now() - t0;
      box.className = res.ok ? "result-box ok" : "result-box error";
      box.textContent = (label ? label + "\n" : "") +
        `HTTP ${res.status} · ${ms}ms\n` +
        JSON.stringify(data, null, 2);
    } catch (err) {
      const ms = Date.now() - t0;
      box.className = "result-box error";
      box.textContent = `Network error after ${ms}ms: ${err.message}`;
    }
  }

  function callSlowApi() {
    const ms = document.getElementById("slow-ms").value || 3000;
    callApi(`/api/slow?ms=${ms}`, "slow-result");
  }

  async function repeatCall(url, resultId, times) {
    const box = document.getElementById(resultId);
    box.className = "result-box info";
    box.textContent = `Firing ${times} requests to ${url}…`;
    const results = await Promise.allSettled(
      Array.from({ length: times }, () => fetch(url).then(r => r.json()))
    );
    const ok    = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;
    box.className = "result-box ok";
    box.textContent = `Done: ${ok} ok, ${failed} failed (out of ${times})`;
  }

  async function trackClick(buttonName) {
    const box = document.getElementById("click-result");
    box.className = "result-box loading";
    box.textContent = `Tracking click: ${buttonName}…`;
    try {
      const res = await fetch("/api/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buttonName }),
      });
      const data = await res.json();
      box.className = "result-box ok";
      box.textContent = `ButtonClicked event sent\nbutton: ${data.buttonName}\ntotal clicks this session: ${data.totalClicks}`;
    } catch (err) {
      box.className = "result-box error";
      box.textContent = "Error: " + err.message;
    }
  }
</script>

</body>
</html>
