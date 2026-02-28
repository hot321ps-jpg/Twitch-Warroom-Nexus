"use client";

import { useState } from "react";
import TwitchEmbed from "@/components/TwitchEmbed";

export default function ChannelCard({ c }: { c: any }) {
  // 預設：直播中就顯示播放器；離線先不顯示（可手動打開）
  const [showPlayer, setShowPlayer] = useState<boolean>(Boolean(c?.isLive));

  return (
    <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{c.displayName}</div>
          <div className="text-sm" style={{ color: "var(--muted)" }}>
            @{c.login} · {c.isLive ? "直播中" : "離線"}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold" style={{ color: c.isLive ? "var(--ok)" : "var(--muted)" }}>
            {c.isLive ? `${c.viewers} viewers` : "offline"}
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
        {c.isLive ? (c.title || "（無標題）") : "目前未開台"}
      </div>

      {/* ✅ Twitch Player iframe */}
      {showPlayer ? (
        <div className="mt-3">
          <TwitchEmbed channel={c.login} autoplay muted height={240} />
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
