import { useState, useEffect, useRef } from "react";

// ─── Design tokens ───────────────────────────────────────────────
const C = {
  bg: "#0b0f14",
  surface: "#111820",
  card: "#141c26",
  border: "#1e2d3d",
  accent: "#00c2ff",
  green: "#00e5a0",
  purple: "#a78bfa",
  amber: "#f59e0b",
  text: "#e2eaf4",
  muted: "#637082",
  danger: "#f87171",
};

// ─── Utility ─────────────────────────────────────────────────────
const cx = (...args) => args.filter(Boolean).join(" ");

// ─── Animated river SVG for map panels ───────────────────────────
function RiverMap({ showPredicted = false, showSaraswati = false, showTerrain = true }) {
  const topo = [
    "M0,180 Q80,120 160,150 Q240,180 320,110 Q400,60 480,90 Q560,120 640,80",
    "M0,220 Q100,200 200,230 Q300,210 400,250 Q500,230 640,260",
    "M0,280 Q120,260 240,290 Q360,270 480,300 Q580,280 640,320",
    "M0,320 Q80,310 160,330 Q260,310 360,340 Q460,320 560,350 Q620,335 640,360",
  ];

  return (
    <svg
      viewBox="0 0 640 400"
      style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0d1b2a 0%, #162032 50%, #1a2a1e 100%)" }}
    >
      {/* Topo lines */}
      {showTerrain && topo.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke="#1e3a2f"
          strokeWidth="1"
          opacity={0.5 - i * 0.07}
        />
      ))}

      {/* Elevation gradient patches */}
      <ellipse cx="480" cy="200" rx="140" ry="100" fill="#1a3020" opacity="0.4" />
      <ellipse cx="100" cy="300" rx="100" ry="60" fill="#152a1e" opacity="0.3" />

      {/* Actual Ganga */}
      <path
        d="M60,100 Q120,140 180,180 Q240,220 300,240 Q360,255 420,280 Q480,300 560,330"
        fill="none"
        stroke={C.accent}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      {/* Actual Yamuna */}
      <path
        d="M160,60 Q200,100 220,150 Q240,200 280,230 Q310,250 300,240"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Predicted path */}
      {showPredicted && (
        <path
          d="M60,110 Q125,148 185,188 Q248,228 306,246 Q364,260 424,284 Q482,306 558,336"
          fill="none"
          stroke={C.danger}
          strokeWidth="2"
          strokeDasharray="8 4"
          strokeLinecap="round"
          opacity="0.85"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-48" dur="2s" repeatCount="indefinite" />
        </path>
      )}

      {/* Saraswati inferred */}
      {showSaraswati && (
        <path
          d="M80,320 Q160,280 240,260 Q320,240 400,250 Q460,255 500,270"
          fill="none"
          stroke={C.purple}
          strokeWidth="1.5"
          strokeDasharray="4 6"
          strokeLinecap="round"
          opacity="0.75"
        >
          <animate attributeName="stroke-dashoffset" from="0" to="-40" dur="3s" repeatCount="indefinite" />
        </path>
      )}

      {/* Sangam point */}
      <circle cx="300" cy="240" r="6" fill="none" stroke={C.amber} strokeWidth="1.5" opacity="0.9" />
      <circle cx="300" cy="240" r="3" fill={C.amber} opacity="0.9" />
      <text x="310" y="236" fill={C.amber} fontSize="8" fontFamily="monospace" opacity="0.9">SANGAM</text>

      {/* Grid overlay */}
      {[1,2,3,4,5].map(i => (
        <line key={`h${i}`} x1="0" y1={i*80} x2="640" y2={i*80} stroke="#1e2d3d" strokeWidth="0.5" />
      ))}
      {[1,2,3,4,5,6,7].map(i => (
        <line key={`v${i}`} x1={i*80} y1="0" x2={i*80} y2="400" stroke="#1e2d3d" strokeWidth="0.5" />
      ))}

      {/* Compass */}
      <g transform="translate(600, 40)">
        <circle r="14" fill="#0d1b2a" stroke="#1e2d3d" strokeWidth="1" />
        <text y="-4" textAnchor="middle" fill={C.accent} fontSize="7" fontFamily="monospace" fontWeight="bold">N</text>
        <line x1="0" y1="-2" x2="0" y2="-10" stroke={C.accent} strokeWidth="1" />
        <line x1="0" y1="2" x2="0" y2="10" stroke={C.muted} strokeWidth="1" />
      </g>

      {/* Scale bar */}
      <g transform="translate(20, 380)">
        <line x1="0" y1="0" x2="60" y2="0" stroke={C.muted} strokeWidth="1" />
        <line x1="0" y1="-3" x2="0" y2="3" stroke={C.muted} strokeWidth="1" />
        <line x1="60" y1="-3" x2="60" y2="3" stroke={C.muted} strokeWidth="1" />
        <text x="30" y="-5" textAnchor="middle" fill={C.muted} fontSize="7" fontFamily="monospace">50 km</text>
      </g>

      {/* CRS label */}
      <text x="580" y="395" fill={C.muted} fontSize="7" fontFamily="monospace" textAnchor="end">WGS84 / EPSG:4326</text>
    </svg>
  );
}

// ─── Terrain mini charts ──────────────────────────────────────────
function TerrainBars({ label, color, values = [] }) {
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, width: "30%" }}>
      <span style={{ color: C.muted, fontSize: 10, fontFamily: "monospace" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: 28, width: "100%" }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              height: `${(v / max) * 100}%`,
              flex: 1, // Auto-scales the bar width
              background: color,
              opacity: 0.6 + (i / values.length) * 0.4,
              borderRadius: "1px 1px 0 0",
              transition: "height 0.6s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────
function Badge({ children, color = C.accent }) {
  return (
    <span
      style={{
        background: color + "22",
        color,
        border: `1px solid ${color}44`,
        borderRadius: 4,
        padding: "2px 8px",
        fontSize: 10,
        fontFamily: "monospace",
        letterSpacing: "0.05em",
      }}
    >
      {children}
    </span>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────
function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={className}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 10,
        padding: 16,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────
function Btn({ children, onClick, color = C.accent, outline = false, small = false, icon = null }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: outline ? "transparent" : hover ? color : color + "dd",
        color: outline ? color : "#000",
        border: `1px solid ${color}`,
        borderRadius: 6,
        padding: small ? "6px 14px" : "9px 20px",
        fontSize: small ? 11 : 13,
        fontFamily: "monospace",
        fontWeight: 700,
        letterSpacing: "0.04em",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}

// ─── Log entry ────────────────────────────────────────────────────
function LogLine({ text, status = "info" }) {
  const colors = { info: C.muted, success: C.green, warn: C.amber, error: C.danger };
  const prefixes = { info: "›", success: "✓", warn: "⚠", error: "✗" };
  return (
    <div style={{ fontFamily: "monospace", fontSize: 11, color: colors[status], lineHeight: 1.7 }}>
      <span style={{ marginRight: 6, opacity: 0.7 }}>{prefixes[status]}</span>{text}
    </div>
  );
}

// ─── Metric card ──────────────────────────────────────────────────
function MetricCard({ label, value, sub, icon, color = C.accent }) {
  return (
    <Card style={{ padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ color: C.text, fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{sub}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 1 – HOME
// ═══════════════════════════════════════════════════════════════════
function HomePage({ navigate }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 2000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: "DEM Resolution", value: "30m", color: C.accent },
    { label: "Study Area", value: "~85,000 km²", color: C.green },
    { label: "Rivers Tracked", value: "2 + 1*", color: C.purple },
    { label: "Model Type", value: "Rule-Based", color: C.amber },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accent + "22", border: `1px solid ${C.accent}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            🌊
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, letterSpacing: "0.05em" }}>RIVER INTELLIGENCE SYSTEM</div>
            <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>Geospatial Trajectory Prediction · v1.0</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge color={C.green}>● LIVE</Badge>
          <Badge color={C.muted}>SRTM · WGS84</Badge>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* Hero map */}
        <Card style={{ marginBottom: 24, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>Study Area — Prayagraj Region, UP, India</div>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginTop: 2 }}>25.45°N 81.84°E · Ganga–Yamuna Doab</div>
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 10, fontFamily: "monospace", color: C.muted }}>
              <span style={{ color: C.accent }}>── Ganga</span>
              <span style={{ color: "#60a5fa" }}>── Yamuna</span>
              <span style={{ color: C.amber }}>◉ Sangam</span>
            </div>
          </div>
          <div style={{ height: 320 }}>
            <RiverMap showTerrain />
          </div>
        </Card>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {[
            {
              icon: "📐", label: "Analysis Workspace", desc: "Process terrain data, compute slope & flow direction, run rule-based trajectory prediction.", color: C.green, action: "Go to Analysis", page: "analysis"
            },
            {
              icon: "〰️", label: "Saraswati Exploration", desc: "Infer conceptual paleochannel path using low-gradient zones and depressions. Non-physical model.", color: C.purple, action: "Explore Saraswati", page: "saraswati"
            },
            {
              icon: "✅", label: "Validation Dashboard", desc: "Evaluate prediction accuracy against reference data. Export maps and metrics.", color: C.accent, action: "View Validation", page: "validation"
            },
          ].map(m => (
            <Card key={m.label} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ width: 40, height: 40, background: m.color + "18", border: `1px solid ${m.color}30`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {m.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, fontFamily: "monospace" }}>{m.label}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{m.desc}</div>
              </div>
              <Btn color={m.color} onClick={() => navigate(m.page)} small>{m.action}</Btn>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
          <Btn onClick={() => navigate("analysis")} color={C.green} icon="▶">
            Start River Simulation
          </Btn>
          <div style={{ marginTop: 10, fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
            * Saraswati path is a conceptual/academic inference — not a physical simulation
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 2 – ANALYSIS WORKSPACE
// ═══════════════════════════════════════════════════════════════════
function AnalysisPage({ navigate }) {
  const [computed, setComputed] = useState({ slope: false, flow: false, accum: false });
  const [predicted, setPredicted] = useState(false);
  const [confluence, setConfluence] = useState(false);
  const [loading, setLoading] = useState(null);
  const [log, setLog] = useState([
    { text: "System initialized. DEM loaded (SRTM 30m).", status: "success" },
    { text: "Study area clipped to Ganga–Yamuna Doab.", status: "success" },
    { text: "Awaiting terrain analysis commands…", status: "info" },
  ]);
  const [sliderElev, setSliderElev] = useState(50);
  const [sliderThresh, setSliderThresh] = useState(35);
  const logRef = useRef();

  const addLog = (text, status = "info") => {
    setLog(prev => [...prev, { text, status }]);
    setTimeout(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, 50);
  };

  const runStep = async (key, messages) => {
    setLoading(key);
    addLog(`Running: ${key}…`, "info");
    await new Promise(r => setTimeout(r, 1400));
    messages.forEach(m => addLog(m.text, m.status));
    setComputed(prev => ({ ...prev, [key]: true }));
    setLoading(null);
  };

  const runPrediction = async () => {
    if (!computed.slope || !computed.flow) { addLog("Compute Slope and Flow Direction first.", "warn"); return; }
    setLoading("predict");
    addLog("Initializing rule-based trajectory prediction…", "info");
    await new Promise(r => setTimeout(r, 800));
    addLog("Step 1/4: Identify seed point at upstream boundary.", "info");
    await new Promise(r => setTimeout(r, 600));
    addLog("Step 2/4: Applying downhill movement rule (min elevation neighbor).", "info");
    await new Promise(r => setTimeout(r, 700));
    addLog("Step 3/4: Slope preference rule applied (max gradient).", "success");
    await new Promise(r => setTimeout(r, 600));
    addLog("Step 4/4: Terrain barrier constraint enforced.", "success");
    await new Promise(r => setTimeout(r, 400));
    addLog("Predicted trajectory generated — 847 waypoints.", "success");
    setPredicted(true);
    setLoading(null);
  };

  const runConfluence = async () => {
    if (!predicted) { addLog("Run prediction first.", "warn"); return; }
    setLoading("confluence");
    addLog("Detecting confluence zones…", "info");
    await new Promise(r => setTimeout(r, 1200));
    addLog("Confluence detected: Ganga ∩ Yamuna @ 25.42°N, 81.88°E", "success");
    addLog("Sangam point verified — Prayagraj.", "success");
    setConfluence(true);
    setLoading(null);
  };

  const terrainBars = {
    elevation: [42, 55, 48, 61, 38, 52, 44, 58, 47, 63, 39, 51],
    slope: [12, 18, 9, 22, 15, 8, 19, 11, 24, 7, 16, 13],
    flow: [3, 5, 8, 7, 4, 9, 6, 11, 8, 12, 9, 14],
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>Analysis Workspace</div>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>Step 2 of 3 · Terrain Analysis & Trajectory Prediction</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn color={C.muted} outline small onClick={() => navigate("home")}>← Home</Btn>
          <Btn color={C.purple} small onClick={() => navigate("saraswati")}>Saraswati →</Btn>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 0, height: "calc(100vh - 56px)" }}>
        {/* LEFT PANEL */}
        <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Terrain controls */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 12, color: C.accent }}>TERRAIN ANALYSIS</div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 6 }}>
                Elevation Threshold: {sliderElev}m
              </div>
              <input type="range" min="10" max="100" value={sliderElev}
                onChange={e => setSliderElev(e.target.value)}
                style={{ width: "100%", accentColor: C.accent }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace", marginBottom: 6 }}>
                Flow Accumulation Threshold: {sliderThresh}
              </div>
              <input type="range" min="10" max="100" value={sliderThresh}
                onChange={e => setSliderThresh(e.target.value)}
                style={{ width: "100%", accentColor: C.green }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "slope", label: "Compute Slope", color: C.green, msgs: [
                  { text: "Slope raster computed — range: 0–42°", status: "success" },
                  { text: "Mean slope: 3.7° (low gradient doab terrain)", status: "info" },
                ]},
                { key: "flow", label: "Compute Flow Direction", color: C.accent, msgs: [
                  { text: "D8 flow direction algorithm applied.", status: "success" },
                  { text: "8 cardinal directions encoded (1–128 scale).", status: "info" },
                ]},
                { key: "accum", label: "Flow Accumulation", color: C.amber, msgs: [
                  { text: "Flow accumulation grid generated.", status: "success" },
                  { text: "High-accumulation cells → drainage network identified.", status: "success" },
                ]},
              ].map(s => (
                <button
                  key={s.key}
                  onClick={() => runStep(s.key, s.msgs)}
                  disabled={!!loading}
                  style={{
                    background: computed[s.key] ? s.color + "22" : C.surface,
                    border: `1px solid ${computed[s.key] ? s.color : C.border}`,
                    borderRadius: 6,
                    padding: "8px 12px",
                    color: computed[s.key] ? s.color : C.text,
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: loading && loading !== s.key ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  <span>{s.label}</span>
                  <span>{loading === s.key ? "⟳" : computed[s.key] ? "✓" : "▶"}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Terrain mini charts */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 12, color: C.muted }}>TERRAIN PROFILE</div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>              
            <TerrainBars label="ELEV" color={C.accent} values={terrainBars.elevation} />
              <TerrainBars label="SLOPE" color={computed.slope ? C.green : C.border} values={terrainBars.slope} />
              <TerrainBars label="FLOW" color={computed.flow ? C.amber : C.border} values={terrainBars.flow} />
            </div>
          </Card>

          {/* Simulation controls */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 12, color: C.green }}>SIMULATION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={runPrediction}
                disabled={!!loading}
                style={{
                  background: predicted ? C.green + "22" : C.green + "11",
                  border: `1px solid ${C.green}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  color: C.green,
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <span>Run Trajectory Prediction</span>
                <span>{loading === "predict" ? "⟳" : predicted ? "✓" : "▶"}</span>
              </button>
              <button
                onClick={runConfluence}
                disabled={!!loading}
                style={{
                  background: confluence ? C.amber + "22" : C.amber + "11",
                  border: `1px solid ${C.amber}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  color: C.amber,
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <span>Detect Confluence</span>
                <span>{loading === "confluence" ? "⟳" : confluence ? "✓" : "▶"}</span>
              </button>
            </div>
          </Card>

          {/* Log */}
          <Card style={{ padding: 14, flex: 1, minHeight: 160 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 10, color: C.muted }}>SIMULATION LOG</div>
            <div ref={logRef} style={{ overflowY: "auto", maxHeight: 200 }}>
              {log.map((l, i) => <LogLine key={i} {...l} />)}
            </div>
          </Card>
        </div>

        {/* RIGHT MAP PANEL */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted }}>MAP VIEW</span>
            <div style={{ display: "flex", gap: 10, fontSize: 10, fontFamily: "monospace" }}>
              <span style={{ color: C.accent }}>── Actual</span>
              {predicted && <span style={{ color: C.danger }}>╌╌ Predicted</span>}
              {confluence && <span style={{ color: C.amber }}>◉ Sangam</span>}
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {computed.slope && <Badge color={C.green}>Slope ✓</Badge>}
              {computed.flow && <Badge color={C.accent}>Flow Dir ✓</Badge>}
              {computed.accum && <Badge color={C.amber}>Accum ✓</Badge>}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <RiverMap showPredicted={predicted} showTerrain />
          </div>

          {/* Algorithm rules panel */}
          {predicted && (
            <div style={{ borderTop: `1px solid ${C.border}`, padding: "12px 16px", background: C.surface }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, marginBottom: 8 }}>ACTIVE RULES</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  "R1: Move to lowest adjacent cell",
                  "R2: Prefer steepest slope",
                  "R3: Follow D8 flow direction",
                  "R4: Avoid terrain barriers",
                ].map(r => (
                  <span key={r} style={{
                    background: C.green + "15",
                    border: `1px solid ${C.green}30`,
                    borderRadius: 4,
                    padding: "3px 8px",
                    fontSize: 10,
                    fontFamily: "monospace",
                    color: C.green,
                  }}>{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// PAGE 3 – SARASWATI & VALIDATION
// ═══════════════════════════════════════════════════════════════════
function SaraswatiPage({ navigate }) {
  const [saraswatiVisible, setSaraswatiVisible] = useState(false);
  const [lowGrad, setLowGrad] = useState(false);
  const [histMap, setHistMap] = useState(false);
  const [loading, setLoading] = useState(null);
  const [metrics, setMetrics] = useState({ mde: null, overlap: null });

  const runLowGrad = async () => {
    setLoading("lg");
    await new Promise(r => setTimeout(r, 1000));
    setLowGrad(true);
    setLoading(null);
  };

  const traceInferred = async () => {
    setLoading("trace");
    await new Promise(r => setTimeout(r, 1400));
    setSaraswatiVisible(true);
    setMetrics({ mde: "312", overlap: "67" });
    setLoading(null);
  };

  const runHistMap = async () => {
    setLoading("hist");
    await new Promise(r => setTimeout(r, 900));
    setHistMap(true);
    setLoading(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      {/* Header */}
      <header style={{ borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13 }}>Saraswati Exploration + Validation</div>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>Step 3 of 3 · Paleochannel Inference & Accuracy Metrics</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn color={C.muted} outline small onClick={() => navigate("analysis")}>← Analysis</Btn>
          <Btn color={C.accent} outline small onClick={() => navigate("home")}>🏠 Home</Btn>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 0, height: "calc(100vh - 56px)" }}>
        {/* LEFT */}
        <div style={{ borderRight: `1px solid ${C.border}`, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Saraswati inference */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 4, color: C.purple }}>
              SARASWATI INFERENCE
            </div>
            <div style={{ fontSize: 10, color: C.muted, lineHeight: 1.6, marginBottom: 12 }}>
              ⚠ Conceptual model only. Based on paleochannel indicators, not physical simulation.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "lg", label: "Identify Low-Gradient Zones", color: C.green, done: lowGrad, fn: runLowGrad },
                { key: "trace", label: "Trace Inferred Path", color: C.purple, done: saraswatiVisible, fn: traceInferred },
              ].map(s => (
                <button
                  key={s.key}
                  onClick={s.fn}
                  disabled={!!loading}
                  style={{
                    background: s.done ? s.color + "22" : C.surface,
                    border: `1px solid ${s.done ? s.color : C.border}`,
                    borderRadius: 6,
                    padding: "8px 12px",
                    color: s.done ? s.color : C.text,
                    fontFamily: "monospace",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    opacity: loading && loading !== s.key ? 0.5 : 1,
                  }}
                >
                  <span>{s.label}</span>
                  <span>{loading === s.key ? "⟳" : s.done ? "✓" : "▶"}</span>
                </button>
              ))}
            </div>

            {saraswatiVisible && (
              <div style={{ marginTop: 12, padding: "10px 12px", background: C.purple + "12", border: `1px solid ${C.purple}30`, borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: C.purple, fontFamily: "monospace", lineHeight: 1.7 }}>
                  Inferred path: Haryana plains → Rajasthan → Arabian Sea (Rann of Kutch corridor)<br />
                  Indicators: Low-gradient zones, paleochannel depressions, satellite-detected dry riverbeds
                </div>
              </div>
            )}
          </Card>

          {/* Validation controls */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 12, color: C.accent }}>VALIDATION</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={runHistMap}
                disabled={!!loading}
                style={{
                  background: histMap ? C.accent + "22" : C.surface,
                  border: `1px solid ${histMap ? C.accent : C.border}`,
                  borderRadius: 6,
                  padding: "8px 12px",
                  color: histMap ? C.accent : C.text,
                  fontFamily: "monospace",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  opacity: loading && loading !== "hist" ? 0.5 : 1,
                }}
              >
                <span>Compare Historical Maps</span>
                <span>{loading === "hist" ? "⟳" : histMap ? "✓" : "▶"}</span>
              </button>
            </div>
          </Card>

          {/* Metrics */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 12, color: C.muted }}>METRICS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Mean Distance Error", value: metrics.mde ? `${metrics.mde} m` : "-- m", color: C.accent, desc: "Avg deviation from reference path" },
                { label: "Overlap Ratio", value: metrics.overlap ? `${metrics.overlap} %` : "-- %", color: C.green, desc: "Predicted vs actual coincidence" },
                { label: "Model Type", value: "Rule-Based", color: C.amber, desc: "GIS terrain rule engine" },
                { label: "Confidence", value: saraswatiVisible ? "Medium" : "--", color: C.purple, desc: "Saraswati inference reliability" },
              ].map(m => (
                <div key={m.label} style={{ borderBottom: `1px solid ${C.border}`, paddingBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>{m.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: m.color, fontFamily: "monospace" }}>{m.value}</span>
                  </div>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Export */}
          <Card style={{ padding: 14 }}>
            <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 12, marginBottom: 10, color: C.muted }}>EXPORT</div>
            {[
              { icon: "📄", label: "Export Report (PDF)", sub: "Full validation report with maps" },
              { icon: "📦", label: "Download Shapefile", sub: "GIS data for further analysis" },
              { icon: "💾", label: "Save Results", sub: "Save to workspace" },
            ].map(e => (
              <button
                key={e.label}
                style={{
                  width: "100%",
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6,
                  padding: "9px 12px",
                  color: C.text,
                  fontFamily: "monospace",
                  fontSize: 11,
                  cursor: "pointer",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 6,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{e.icon}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>{e.label}</div>
                  <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>{e.sub}</div>
                </div>
              </button>
            ))}
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Map legend */}
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 16, alignItems: "center" }}>
            <span style={{ fontFamily: "monospace", fontSize: 11, color: C.muted }}>VALIDATION MAP</span>
            <div style={{ display: "flex", gap: 12, fontSize: 10, fontFamily: "monospace" }}>
              <span style={{ color: C.accent }}>── Actual Rivers</span>
              <span style={{ color: C.danger }}>╌╌ Predicted</span>
              {saraswatiVisible && <span style={{ color: C.purple }}>╌╌ Saraswati (Inferred)</span>}
            </div>
            {histMap && <Badge color={C.accent}>Historical overlay active</Badge>}
          </div>

          <div style={{ flex: 1 }}>
            <RiverMap showPredicted showSaraswati={saraswatiVisible} showTerrain />
          </div>

          {/* Results summary */}
          {metrics.mde && (
            <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px", background: C.surface }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: C.muted, marginBottom: 8 }}>RESULTS SUMMARY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  "Predicted path follows terrain slope trends.",
                  "Confluence detected near Sangam (Prayagraj).",
                  "Saraswati inference aligns with low-gradient zones.",
                ].map((r, i) => (
                  <div key={i} style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "flex-start",
                    padding: "8px 10px",
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    fontSize: 11,
                    color: C.text,
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: C.green, marginTop: 1 }}>●</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 10,
                padding: "10px 14px",
                background: C.accent + "0e",
                border: `1px solid ${C.accent}25`,
                borderRadius: 6,
                fontSize: 11,
                color: C.muted,
                fontFamily: "monospace",
              }}>
                ℹ The analysis shows promising alignment between predicted and historical river patterns, with particular strength in terrain-based flow direction modeling.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT APP
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");

  const pages = {
    home: <HomePage navigate={setPage} />,
    analysis: <AnalysisPage navigate={setPage} />,
    saraswati: <SaraswatiPage navigate={setPage} />,
    validation: <SaraswatiPage navigate={setPage} />,
  };

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      fontSize: 13,
      background: C.bg,
      minHeight: "100vh",
      color: C.text,
    }}>
      {pages[page] || pages.home}
    </div>
  );
}