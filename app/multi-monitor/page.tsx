"use client";

import { useEffect, useMemo, useState } from "react";
import MultiChannelGrid from "@/components/MultiChannelGrid";

function parseList(raw: string) {
  return raw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function sample() {
  return ["wsx70529", "shroud", "pokimane"].join(", ");
}

export default function MultiMonitorPage() {
  const [raw, setRaw] = useState(""); // ✅ 預設空白
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSec, setRefreshSec] = useState(30);

  const channels = useMemo(() => parseList(raw), [raw]);
  const hasChannels = channels.length > 0;

  // ✅ 商用產品常見：記住使用者設定（但第一次仍然空白）
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tw_wn_channels_v2");
      if (saved) setRaw(saved);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tw_wn_channels_v2", raw);
    } catch {}
  }, [raw]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">多頻道監控</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            商用級監控面板：快速配置、狀態摘要、嵌入播放器（懶載入）
          </p>
        </div>

        {/* Quick settings */}
        <div className="flex items-center gap-3">
          <div className="text-sm" style={{ color: "var(--muted)" }}>自動刷新</div>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          <select
            value={refreshSec}
            onChange={(e) => setRefreshSec(Number(e.target.value))}
            className="rounded-lg px-2 py-1 border bg-transparent"
            style={{ borderColor: "var(--border)" }}
          >
            <option value={10}>10s</option>
            <option value={20}>20s</option>
            <option value={30}>30s</option>
            <option value={60}>60s</option>
          </select>
        </div>
      </div>

      {/* Config Card */}
      <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="font-semibold">監控清單</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              逗號或換行分隔（Twitch login）。未填寫時面板保持空白。
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="text-xs px-2 py-1 rounded-full border"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              共 {channels.length} 個頻道
            </span>

            <button
              onClick={() => setRaw(sample())}
              className="text-sm px-3 py-2 rounded-xl border hover:opacity-90"
              style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.04)" }}
              title="填入範例（可再自行修改）"
            >
              套用範例
            </button>

            <button
              onClick={() => setRaw("")}
              className="text-sm px-3 py-2 rounded-xl border hover:opacity-90"
              style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.04)" }}
              title="清空清單"
            >
              清空
            </button>
          </div>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="mt-3 w-full min-h-[96px] rounded-xl p-3 border bg-transparent outline-none"
          style={{ borderColor: "var(--border)" }}
          placeholder="例如：wsx70529, shroud, pokimane"
        />

        {/* Guidance row */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
            <div className="text-sm font-semibold">自動開前 6 台</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              只會自動展開「直播中」前 6 台，其他可手動開啟。
            </div>
          </div>
          <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
            <div className="text-sm font-semibold">懶載入播放器</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              只有卡片進入視窗時才載入 iframe，節省 CPU/網路。
            </div>
          </div>
          <div className="rounded-xl border p-3" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
            <div className="text-sm font-semibold">部署相容</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              iframe 會自動帶 parent=你的網域（Vercel/本機皆可）。
            </div>
          </div>
        </div>
      </div>

      {/* Grid / Empty state inside grid */}
      <MultiChannelGrid channels={channels} autoRefresh={autoRefresh} refreshSec={refreshSec} />

      {/* Optional product-like footer hint */}
      {!hasChannels ? (
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          小提示：輸入頻道後，卡片會顯示狀態與播放器；未輸入時此頁保持乾淨空白（方便上牆/展示）。
        </div>
      ) : null}
    </div>
  );
}
