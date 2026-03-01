"use client";

import { useEffect, useState } from "react";
import TwitchEmbed from "@/components/TwitchEmbed";

export default function ChannelCard({
  c,
  defaultOpen = false
}: {
  c: any;
  defaultOpen?: boolean;
}) {
  const [showPlayer, setShowPlayer] = useState<boolean>(defaultOpen);

  useEffect(() => {
    setShowPlayer((prev) => prev || defaultOpen);
  }, [defaultOpen]);

  return (
    <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{c.displayName}</div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            @{c.login} · {c.isLive ? "直播中" : "（未判定 / 離線）"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold" style={{ color: c.isLive ? "var(--ok)" : "var(--muted)" }}>
            {c.isLive ? `${c.viewers} viewers` : "—"}
          </div>

          <button
            onClick={() => setShowPlayer((v) => !v)}
            className="text-xs px-2 py-1 rounded-lg border hover:opacity-90"
            style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.04)" }}
          >
            {showPlayer ? "收起" : "顯示"}
          </button>
        </div>
      </div>

      <div className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
        {c.isLive ? (c.title || "（無標題）") : "可直接開啟播放器監看"}
      </div>

      {showPlayer ? (
        <div className="mt-3">
          <TwitchEmbed channel={c.login} autoplay muted height={240} rootMargin="250px" />
        </div>
      ) : null}

      {c.flags?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {c.flags.map((f: string) => (
            <span key={f} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)" }}>
              {f}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
