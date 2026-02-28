"use client";

import { useEffect, useMemo, useState } from "react";
import MultiChannelGrid from "@/components/MultiChannelGrid";

function parseList(raw: string) {
  return raw
    .split(/[,\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function MultiMonitorPage() {
  const [raw, setRaw] = useState("wsx70529");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshSec, setRefreshSec] = useState(30);

  const channels = useMemo(() => parseList(raw), [raw]);

  useEffect(() => {
    try {
      localStorage.setItem("tw_wn_channels", raw);
    } catch {}
  }, [raw]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tw_wn_channels");
      if (saved) setRaw(saved);
    } catch {}
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">多頻道監控</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Grid 監看 / 即時刷新 / 離線與異常提示
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm" style={{ color: "var(--muted)" }}>
            自動刷新
          </label>
          <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
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

      <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="font-semibold">監控清單</div>
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              逗號或換行分隔（login 名稱）
            </div>
          </div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            共 {channels.length} 個頻道
          </div>
        </div>

        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          className="mt-3 w-full min-h-[90px] rounded-xl p-3 border bg-transparent outline-none"
          style={{ borderColor: "var(--border)" }}
          placeholder="例如：wsx70529, shroud, pokimane"
        />
      </div>

      <MultiChannelGrid channels={channels} autoRefresh={autoRefresh} refreshSec={refreshSec} />
    </div>
  );
}
