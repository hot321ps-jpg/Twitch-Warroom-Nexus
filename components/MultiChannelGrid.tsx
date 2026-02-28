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
      setData({
        generatedAt: Date.now(),
        alerts: [],
        channels: []
      });
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

  // ✅ 只讓「直播中」依序前 6 台 defaultOpen
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

  // ✅ 商用儀表板：空狀態（不會顯示測試帳號/卡片）
  if (!hasChannels) {
    return (
      <div className="rounded-2xl p-6 border" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-lg font-semibold">尚未加入任何頻道</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              在上方「監控清單」貼上 Twitch login（逗號或換行分隔），即可開始監控與嵌入播放。
            </div>
          </div>

          <div className="text-xs px-3 py-2 rounded-xl border" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
            面板狀態：待命（無資料請求）
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <div className="font-semibold">效率</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              未設定頻道時不打 API、不載入 iframe，適合上牆展示。
            </div>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <div className="font-semibold">可靠</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              Twitch embed 自動帶 parent=你的網域，避免黑屏。
            </div>
          </div>
          <div className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)" }}>
            <div className="font-semibold">可擴充</div>
            <div className="text-sm mt-1" style={{ color: "var(--muted)" }}>
              下一步可接：告警 Webhook、輪播大螢幕、趨勢圖。
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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
            自動展開：直播中前 6 台
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

      {/* Alerts (if any) */}
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
