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

  async function refresh() {
    if (!channels.length) {
      setData({ channels: [], alerts: [{ type: "warn", text: "請先輸入至少 1 個頻道 login。" }] });
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
    if (!autoRefresh) return;
    const t = setInterval(refresh, Math.max(5, refreshSec) * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshSec, query]);

  // ✅ 核心：只讓「直播中」依序前 6 台 defaultOpen
  const defaultOpenMap = useMemo(() => {
    const map = new Map<string, boolean>();
    const list = data?.channels ?? [];

    let opened = 0;
    for (const c of list) {
      if (c?.isLive && opened < 6) {
        map.set(c.login, true);
        opened += 1;
      } else {
        map.set(c.login, false);
      }
    }
    return map;
  }, [data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm" style={{ color: "var(--muted)" }}>
          {loading ? "更新中..." : data ? `已更新：${new Date(data.generatedAt).toLocaleString("zh-TW")}` : "尚未載入"}
        </div>
        <button
          onClick={refresh}
          className="text-sm px-3 py-2 rounded-xl border hover:opacity-90"
          style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.04)" }}
        >
          立即刷新
        </button>
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
          <ChannelCard
            key={c.login}
            c={c}
            defaultOpen={Boolean(defaultOpenMap.get(c.login))}
          />
        ))}
      </div>
    </div>
  );
}
