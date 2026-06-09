const appInsights = require("applicationinsights");

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  appInsights
    .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true, true)
    .setUseDiskRetryCaching(true)
    .start();
  console.log("✅ Application Insights initialised");
} else {
  console.warn("⚠️  APPLICATIONINSIGHTS_CONNECTION_STRING not set – telemetry disabled");
}

const express = require("express");
const https   = require("https");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;
const aiClient = appInsights.defaultClient;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function trackEvent(name, properties = {}, measurements = {}) {
  if (aiClient) aiClient.trackEvent({ name, properties, measurements });
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/fast", (req, res) => {
  console.log("📡 /api/fast called");
  trackEvent("FastEndpointCalled");
  res.json({ status: "ok", message: "This was fast!", timestamp: new Date() });
});

app.get("/api/slow", (req, res) => {
  const delay = parseInt(req.query.ms) || 3000;
  trackEvent("SlowEndpointCalled", { delayMs: String(delay) }, { delayMs: delay });
  setTimeout(() => res.json({ status: "ok", message: `Responded after ${delay}ms`, delay }), delay);
});

app.get("/api/error", (req, res) => {
  const err = new Error("Simulated internal server error");
  if (aiClient) aiClient.trackException({ exception: err });
  res.status(500).json({ status: "error", message: "Something went wrong on purpose!" });
});

let buttonPressCount = 0;
app.post("/api/track-click", (req, res) => {
  const { buttonName } = req.body;
  buttonPressCount++;
  if (aiClient) {
    aiClient.trackEvent({ name: "ButtonClicked", properties: { buttonName: buttonName || "unknown" }, measurements: { totalClicks: buttonPressCount } });
    aiClient.trackMetric({ name: "ButtonPressCount", value: buttonPressCount });
  }
  res.json({ status: "ok", buttonName, totalClicks: buttonPressCount });
});

app.get("/api/external", (req, res) => {
  const options = { hostname: "httpbin.org", path: "/get", method: "GET", headers: { "User-Agent": "azure-demo-app" } };
  const externalReq = https.request(options, (externalRes) => {
    externalRes.on("data", () => {});
    externalRes.on("end", () => res.json({ status: "ok", message: "Called httpbin.org/get", upstream_status: externalRes.statusCode }));
  });
  externalReq.on("error", (err) => res.status(502).json({ status: "error", message: "Upstream call failed" }));
  externalReq.end();
});

app.get("/api/crash", (req, res, next) => {
  next(new Error("Intentional crash for demo purposes"));
});

app.use((err, req, res, next) => {
  if (aiClient) aiClient.trackException({ exception: err });
  res.status(500).json({ status: "error", message: err.message });
});

app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));