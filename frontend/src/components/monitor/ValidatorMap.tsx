import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ValidatorData {
  validatorId: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  trustScore: number;
  latestStatus: "Good" | "Bad" | string;
  latency: number;
  lastChecked: string;
}

interface ValidatorMapProps {
  websiteId: string;
  websiteName?: string;
  websiteUrl?: string;
  websiteStatus?: "up" | "down" | "warning";
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS = {
  Good: { color: "#10b981", glow: "rgba(16,185,129,0.35)", label: "UP",   bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  Bad:  { color: "#f43f5e", glow: "rgba(244,63,94,0.35)",  label: "DOWN", bg: "rgba(244,63,94,0.12)",  text: "#fb7185" },
  _:    { color: "#f59e0b", glow: "rgba(245,158,11,0.35)", label: "WARN", bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
};

const getStatus = (s: string) => STATUS[s as keyof typeof STATUS] ?? STATUS._;

// ─── Fit bounds helper ────────────────────────────────────────────────────────

const FitBounds = ({ validators }: { validators: ValidatorData[] }) => {
  const map = useMap();
  useEffect(() => {
    const valid = validators.filter((v) => v.latitude != null && v.longitude != null && !(v.latitude === 0 && v.longitude === 0));
    if (valid.length === 0) return;
    if (valid.length === 1) { map.setView([valid[0].latitude, valid[0].longitude], 5); return; }
    const lats = valid.map((v) => v.latitude);
    const lngs = valid.map((v) => v.longitude);
    map.fitBounds(
      [[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]],
      { padding: [60, 60], maxZoom: 8 }
    );
  }, [validators.length]);
  return null;
};

// ─── Zoom-to-dot-size mapping ─────────────────────────────────────────────────
// Dots are tiny at full zoom-out and grow smoothly as the user zooms in
const dotRadiusForZoom = (zoom: number): number => {
  if (zoom <= 2)  return 2;
  if (zoom <= 4)  return 3;
  if (zoom <= 6)  return 5;
  if (zoom <= 8)  return 7;
  if (zoom <= 10) return 10;
  if (zoom <= 12) return 14;
  return 18;
};

// ─── ZoomAwareMarker ──────────────────────────────────────────────────────────
// Each marker manages its OWN zoom tracking via useMap(), so it always renders
// at the correct size and updates instantly via setIcon() on the Leaflet element.
interface ZoomAwareMarkerProps {
  validator: ValidatorData;
  isSelected: boolean;
  onSelect: () => void;
}

const ZoomAwareMarker: React.FC<ZoomAwareMarkerProps> = ({ validator, isSelected, onSelect }) => {
  const map = useMap();
  // Initialize from the REAL current map zoom — not a hardcoded default
  const [zoom, setZoom] = useState<number>(() => map.getZoom());
  const markerRef = useRef<L.Marker | null>(null);

  // Listen to 'zoom' (fires during animation) for smooth scaling
  useEffect(() => {
    const onZoom = () => setZoom(map.getZoom());
    map.on("zoom", onZoom);
    return () => { map.off("zoom", onZoom); };
  }, [map]);

  // Rebuild and apply the icon whenever zoom or selection changes
  useEffect(() => {
    if (!markerRef.current) return;
    const s = getStatus(validator.latestStatus);
    const dotR = dotRadiusForZoom(zoom);
    const icon = buildDivIcon(s.color, dotR, isSelected);
    markerRef.current.setIcon(icon);
  }, [zoom, isSelected, validator.latestStatus]);

  const s = getStatus(validator.latestStatus);
  const dotR = dotRadiusForZoom(zoom);
  const icon = buildDivIcon(s.color, dotR, isSelected);

  return (
    <Marker
      ref={markerRef}
      position={[validator.latitude, validator.longitude]}
      icon={icon}
      eventHandlers={{ click: onSelect }}
    >
      <Popup className="validator-popup" closeButton={false}>
        <div style={{
          background: "rgba(10,15,30,0.97)",
          border: `1px solid ${s.color}44`,
          borderRadius: 12,
          padding: "14px 16px",
          minWidth: 200,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${s.color}22`,
          fontFamily: "Inter, sans-serif",
        }}>
          {/* Name + status */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#f1f5f9" }}>{validator.name}</div>
            <div style={{
              padding: "2px 8px", borderRadius: 20,
              background: s.bg, color: s.text,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
            }}>
              {s.label}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 10 }} />

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
            {[
              { icon: "📍", label: "Location", val: validator.location },
              { icon: "⚡", label: "Latency",  val: `${validator.latency}ms` },
              { icon: "🛡️", label: "Trust",    val: `${validator.trustScore}/100` },
              { icon: "🕒", label: "Checked",  val: new Date(validator.lastChecked).toLocaleTimeString() },
            ].map(({ icon, label, val }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>{icon} {label}</div>
                <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 500 }}>{val}</div>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div style={{ marginTop: 12 }}>
            <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 2,
                width: `${validator.trustScore}%`,
                background: `linear-gradient(90deg, ${s.color}88, ${s.color})`,
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// ─── Build a glowy DivIcon for a validator marker ─────────────────────────────
const buildDivIcon = (
  color: string,
  dotR: number,
  isSelected: boolean
): L.DivIcon => {
  // Ring hugs the dot: just 1.6× dot radius so there's no gap
  const ringR = Math.round(dotR * 1.6);
  // Canvas must fit the ring + enough room for the glow shadow to bleed
  const bleed = Math.round(dotR * 2.5); // extra space around ring for box-shadow
  const total = ringR * 2 + bleed * 2;
  const center = total / 2;

  // selected markers get a slightly bigger ring and bolder dot
  const finalDot  = isSelected ? Math.round(dotR * 1.4) : dotR;
  const finalRing = isSelected ? Math.round(ringR * 1.25) : ringR;

  const html = `
    <div style="
      width: ${total}px;
      height: ${total}px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <!-- twinkling glow ring — sits just outside the dot -->
      <div class="vmap-ring" style="
        position: absolute;
        width: ${finalRing * 2}px;
        height: ${finalRing * 2}px;
        border-radius: 50%;
        border: 1.5px solid ${color}bb;
        box-shadow: 0 0 ${Math.round(dotR * 3)}px ${color}88,
                    0 0 ${Math.round(dotR * 6)}px ${color}33;
        animation: vmap-twinkle 2s ease-in-out infinite;
        animation-delay: ${Math.random().toFixed(2)}s;
      "></div>
      <!-- inner solid dot -->
      <div style="
        width: ${finalDot * 2}px;
        height: ${finalDot * 2}px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 ${Math.round(finalDot * 1.5)}px ${color}dd,
                    0 0 ${Math.round(finalDot * 3)}px ${color}66;
        position: relative;
        z-index: 2;
        flex-shrink: 0;
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "", // no leaflet default styles
    iconSize:   [total, total],
    iconAnchor: [center, center],
    popupAnchor:[0, -(center + 4)],
  });
};

// ─── Custom Zoom Control ──────────────────────────────────────────────────────

const CustomZoomControl = () => {
  const map = useMap();
  return (
    <div style={{
      position: "absolute", top: 20, right: 20, zIndex: 1000,
      display: "flex", flexDirection: "column", gap: 2,
    }}>
      {[{ label: "+", action: () => map.zoomIn() }, { label: "−", action: () => map.zoomOut() }].map(({ label, action }) => (
        <button
          key={label}
          onClick={action}
          style={{
            width: 36, height: 36, borderRadius: 8,
            background: "rgba(15,23,42,0.92)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#e2e8f0",
            fontSize: 20, fontWeight: 300, lineHeight: 1,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
            transition: "all 0.15s",
            boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.25)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(15,23,42,0.92)")}
        >
          {label}
        </button>
      ))}
      <button
        onClick={() => map.setView([20, 0], 2)}
        title="Reset view"
        style={{
          marginTop: 4, width: 36, height: 36, borderRadius: 8,
          background: "rgba(15,23,42,0.92)",
          border: "1px solid rgba(99,102,241,0.25)",
          color: "#94a3b8", fontSize: 13, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
          transition: "all 0.15s",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.25)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(15,23,42,0.92)")}
      >
        ⊙
      </button>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ValidatorMap: React.FC<ValidatorMapProps> = ({
  websiteId,
  websiteName,
  websiteUrl,
  websiteStatus,
}) => {
  const [validators, setValidators] = useState<ValidatorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [persistedFallback, setPersistedFallback] = useState<{ used: boolean; timestamp?: string }>({ used: false });
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  // ── Initial fetch via REST ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchValidators = async () => {
      try {
        const res = await fetch(`http://localhost:3000/website/${websiteId}/validators`);
        if (!res.ok) throw new Error("Failed to fetch validators");
        const data: ValidatorData[] = await res.json();
        if (data && data.length > 0) {
          setValidators(data);
          try {
            const key = `watchtower:validatorMap:last:${websiteId}`;
            localStorage.setItem(key, JSON.stringify({ validators: data, timestamp: new Date().toISOString() }));
            setPersistedFallback({ used: false });
          } catch (err) {
            console.warn("[ValidatorMap] failed to persist validators", err);
          }
        } else {
          const key = `watchtower:validatorMap:last:${websiteId}`;
          try {
            const raw = localStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              if (parsed?.validators && parsed.validators.length > 0) {
                setValidators(parsed.validators);
                setPersistedFallback({ used: true, timestamp: parsed.timestamp });
              } else { setValidators([]); }
            } else { setValidators([]); }
          } catch (err) {
            console.warn("[ValidatorMap] failed to read persisted validators", err);
            setValidators([]);
          }
        }
      } catch (err) {
        console.error("[ValidatorMap] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchValidators();
  }, [websiteId]);

  // ── WebSocket ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const HUB_WS_URL = import.meta.env.VITE_HUB_WS_URL || "ws://localhost:8081";
    const connect = () => {
      const ws = new WebSocket(HUB_WS_URL);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "dashboard-connect" }));
        setWsConnected(true);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "validator-status-update") {
            const { validatorId, websiteId: updatedWebsiteId, status, latency, timestamp } = msg.data;
            if (updatedWebsiteId !== websiteId) return;
            setValidators((prev) => {
              let found = false;
              const next = prev.map((v) => {
                if (v.validatorId === validatorId) {
                  found = true;
                  return { ...v, latestStatus: status, latency: latency ?? v.latency, lastChecked: timestamp ?? v.lastChecked };
                }
                return v;
              });
              if (!found) {
                next.push({ validatorId, name: `Validator ${validatorId}`, location: "Unknown", latitude: 0, longitude: 0, trustScore: 0, latestStatus: status, latency: latency ?? 0, lastChecked: timestamp ?? new Date().toISOString() });
              }
              try {
                const key = `watchtower:validatorMap:last:${websiteId}`;
                localStorage.setItem(key, JSON.stringify({ validators: next, timestamp: new Date().toISOString() }));
                setPersistedFallback({ used: false });
              } catch (err) {
                console.warn("[ValidatorMap] failed to persist validators after WS update", err);
              }
              return next;
            });
          }
        } catch (err) { console.error("[ValidatorMap] WS parse error:", err); }
      };
      ws.onclose = () => { setWsConnected(false); setTimeout(connect, 3000); };
      ws.onerror = (err) => { console.error("[ValidatorMap] WS error:", err); ws.close(); };
    };
    connect();
    return () => { wsRef.current?.close(); };
  }, [websiteId]);

  const upCount    = validators.filter((v) => v.latestStatus === "Good").length;
  const downCount  = validators.filter((v) => v.latestStatus === "Bad").length;
  const warnCount  = validators.filter((v) => v.latestStatus !== "Good" && v.latestStatus !== "Bad").length;
  const avgLatency = validators.length
    ? Math.round(validators.reduce((a, v) => a + (v.latency || 0), 0) / validators.length)
    : 0;

  return (
    <>
      {/* Inject custom Leaflet popup + animation styles */}
      <style>{`
        .validator-popup .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
        }
        .validator-popup .leaflet-popup-content {
          margin: 0 !important;
        }
        .validator-popup .leaflet-popup-tip-container {
          display: none !important;
        }
        .leaflet-container {
          font-family: 'Inter', 'Segoe UI', sans-serif !important;
        }
        .leaflet-control-attribution {
          display: none !important;
        }
        /* Twinkling / glowing ring animation */
        @keyframes vmap-twinkle {
          0%   { transform: scale(0.85); opacity: 0.55; }
          40%  { transform: scale(1.15); opacity: 1;    }
          70%  { transform: scale(1.00); opacity: 0.75; }
          100% { transform: scale(0.85); opacity: 0.55; }
        }
        .vmap-ring {
          pointer-events: none;
        }
        @keyframes pulse-red {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(99,102,241,0.18)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(23,31,56,0.95) 100%)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>

        {/* ── Header ── */}
        <div style={{
          padding: "18px 24px",
          borderBottom: "1px solid rgba(99,102,241,0.15)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          background: "rgba(99,102,241,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>🌐</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.01em" }}>
                Validator Network Map
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>
                Monitoring{" "}
                <span style={{ color: "#94a3b8" }}>{websiteName || websiteUrl || "this site"}</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {[
              { count: upCount,   color: "#10b981", bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.2)",  label: "UP"   },
              { count: downCount, color: "#f43f5e", bg: "rgba(244,63,94,0.1)",   border: "rgba(244,63,94,0.2)",   label: "DOWN" },
              { count: warnCount, color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.2)",  label: "WARN" },
            ].map(({ count, color, bg, border, label }) => (
              <div key={label} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "5px 12px", borderRadius: 20,
                background: bg, border: `1px solid ${border}`,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.04em" }}>
                  {count} {label}
                </span>
              </div>
            ))}

            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20,
              background: "rgba(148,163,184,0.07)",
              border: "1px solid rgba(148,163,184,0.12)",
            }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>avg</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{avgLatency}ms</span>
            </div>

            {/* Live badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "5px 12px", borderRadius: 20,
              background: wsConnected ? "rgba(99,102,241,0.12)" : "rgba(100,116,139,0.08)",
              border: wsConnected ? "1px solid rgba(99,102,241,0.25)" : "1px solid rgba(100,116,139,0.15)",
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", display: "inline-block",
                background: wsConnected ? "#818cf8" : "#475569",
                ...(wsConnected ? { animation: "pulse-red 1.6s ease-in-out infinite" } : {}),
              }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: wsConnected ? "#818cf8" : "#475569", letterSpacing: "0.04em" }}>
                {wsConnected ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Map Area ── */}
        {loading ? (
          <div style={{
            height: 480, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(10,15,30,0.6)", gap: 16,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "2px solid rgba(99,102,241,0.2)",
              borderTopColor: "#6366f1",
              animation: "spin 0.8s linear infinite",
            }} />
            <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>Fetching validator locations…</p>
          </div>
        ) : validators.length === 0 ? (
          <div style={{
            height: 480, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            background: "rgba(10,15,30,0.6)", gap: 12,
          }}>
            <div style={{ fontSize: 36 }}>🗺️</div>
            <p style={{ color: "#475569", fontSize: 13, margin: 0 }}>No validators with location data yet.</p>
          </div>
        ) : (
          <div style={{ height: 480, position: "relative", overflow: "hidden" }}>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={2}
              maxBounds={[[-90, -180], [90, 180]]}
              maxBoundsViscosity={1.0}
              zoomControl={false}
              scrollWheelZoom={true}
              touchZoom={true}
              doubleClickZoom={true}
              keyboard={true}
              style={{ height: "100%", width: "100%", background: "#060d1a" }}
              className="z-0"
              attributionControl={false}
            >
              {/* Dark base — no country/region labels */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
              />
              {/* English label overlay */}
              <TileLayer
                url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png"
                subdomains="abcd"
                opacity={0.8}
              />
              <FitBounds validators={validators} />
              <CustomZoomControl />
              {/* Group validators by coordinate and render only the worst status to prevent color blending */}
              {(() => {
                const uniqueLocs: Record<string, ValidatorData> = {};
                validators.forEach((v) => {
                  // Skip invalid or unmapped validators located at 0, 0 (Null Island in the sea)
                  if (v.latitude === 0 && v.longitude === 0) return;

                  const key = `${v.latitude},${v.longitude}`;
                  const existing = uniqueLocs[key];
                  if (!existing) {
                    uniqueLocs[key] = v;
                  } else {
                    const getPri = (s: string) => {
                      if (s === "Bad") return 3;
                      if (s === "Good") return 1;
                      return 2;
                    };
                    if (getPri(v.latestStatus) > getPri(existing.latestStatus)) {
                      uniqueLocs[key] = v;
                    }
                  }
                });

                return Object.values(uniqueLocs).map((validator) => (
                  <ZoomAwareMarker
                    key={validator.validatorId}
                    validator={validator}
                    isSelected={selectedValidator === validator.validatorId}
                    onSelect={() => setSelectedValidator(
                      selectedValidator === validator.validatorId ? null : validator.validatorId
                    )}
                  />
                ));
              })()}
            </MapContainer>

            {/* ── Legend overlay ── */}
            <div style={{
              position: "absolute", bottom: 20, left: 20, zIndex: 999,
              background: "rgba(10,15,30,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: 12,
              padding: "12px 16px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
            }}>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>
                LEGEND
              </div>
              {[
                { color: "#10b981", label: "Reachable (UP)" },
                { color: "#f43f5e", label: "Unreachable (DOWN)" },
                { color: "#f59e0b", label: "Warning" },
              ].map(({ color, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 6px ${color}88`,
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* ── Validator count badge ── */}
            <div style={{
              position: "absolute", top: 20, left: 20, zIndex: 999,
              background: "rgba(10,15,30,0.92)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(99,102,241,0.15)",
              borderRadius: 10,
              padding: "8px 14px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
              fontSize: 12,
              color: "#64748b",
            }}>
              <span style={{ color: "#818cf8", fontWeight: 700 }}>{validators.length}</span> validators
            </div>

            {/* ── Stale data notice ── */}
            {persistedFallback.used && (
              <div style={{
                position: "absolute", bottom: 16, left: "50%",
                transform: "translateX(-50%)", zIndex: 999,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 10, padding: "8px 14px",
                backdropFilter: "blur(8px)",
                fontSize: 11, color: "#a5b4fc",
                display: "flex", gap: 8, alignItems: "center",
                whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: 13 }}>⚠</span>
                <span>Showing cached data
                  {persistedFallback.timestamp
                    ? ` · ${new Date(persistedFallback.timestamp).toLocaleString()}`
                    : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <div style={{
          padding: "10px 24px",
          borderTop: "1px solid rgba(99,102,241,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(10,15,30,0.3)",
        }}>
          <span style={{ fontSize: 11, color: "#334155" }}>
            Scroll / pinch to zoom · Click markers for details
          </span>
          <span style={{ fontSize: 11, color: "#334155" }}>
            © CartoDB
          </span>
        </div>
      </div>
    </>
  );
};
export default ValidatorMap;