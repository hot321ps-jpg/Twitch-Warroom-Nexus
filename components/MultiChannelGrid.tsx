"use client";

import { useEffect, useMemo, useState } from "react";
import ChannelCard from "@/components/ChannelCard";

export default function MultiChannelGrid({
  channels,
  autoRefresh,
  refreshSec
}: {
  channels: string[];
  autoRefresh: boolean;
  refreshSec: number;
}) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const query = useMemo(() => channels.join(","), [channels]);
  const hasChannels = channels.length > 0;

  async function refresh() {
    if (!hasChannels) {
      setData({ generatedAt: Date.now(), usedMock: false, alerts: [], channels: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/warroom-refresh?channels=${encodeURIComponent(query)}`, { cache: "no-store" });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!autoRefresh || !hasChannels) return;
    const t = setInterval(refresh, Math.max(5, refreshSec) * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshSec, query, hasChannels]);

  // ✅ usedMock=true（監看模式）→ 自動開前 6 張
  // ✅ usedMock=false（真實數據）→ 自動開直播中前 6 張
  const defaultOpenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    const list = data?.channels ?? [];
    const usedMock = Boolean(data?.usedMock);

    let opened = 0;
    for (const c of list) {
      const shouldAutoOpen = usedMock ? opened < 6 : (c?.isLive && opened < 6);

      if (shouldAutoOpen) {
        map.set(c.login, true);
        opened += 1;
      } else {
        map.set(c.login, false);
      }
    }
    return map;
  }, [data]);

  if (!hasChannels) {
    return (
      <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
        <div className="text-lg font-semibold">尚未加入任何頻道</div>
        <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          在上方貼上 Twitch login（逗號或換行分隔）即可開始監看。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {loading
            ? "更新中..."
            : data
              ? `已更新：${new Date(data.generatedAt).toLocaleString("zh-TW")}`
              : "尚未載入"}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            自動展開：{data?.usedMock ? "前 6 張（監看模式）" : "直播中前 6 張"}
          </span>

          <button
            onClick={refresh}
            className="text-sm px-3 py-2 rounded-xl border hover:opacity-90"
            style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.04)" }}
          >
            立即刷新
          </button>
        </div>
      </div>

      {data?.alerts?.length ? (
        <div className="rounded-2xl p-4 border" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
          <div className="font-semibold mb-2">狀態提示</div>
          <ul className="text-sm space-y-1" style={{ color: "var(--muted)" }}>
            {data.alerts.map((a: any, i: number) => (
              <li key={i}>• [{a.type}] {a.text}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(data?.channels ?? []).map((c: any) => (
          <ChannelCard key={c.login} c={c} defaultOpen={Boolean(defaultOpenMap.get(c.login))} />
        ))}
      </div>
    </div>
  );
}
