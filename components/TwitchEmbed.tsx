"use client";

import { useEffect, useMemo, useState } from "react";

export default function TwitchEmbed({
  channel,
  autoplay = true,
  muted = true,
  height = 240
}: {
  channel: string;
  autoplay?: boolean;
  muted?: boolean;
  height?: number;
}) {
  const [parent, setParent] = useState<string>("");

  useEffect(() => {
    // Twitch embed 需要 parent 參數，且必須等到 client 才能取得 hostname
    setParent(window.location.hostname);
  }, []);

  const src = useMemo(() => {
    if (!parent) return "";
    const url = new URL("https://player.twitch.tv/");
    url.searchParams.set("channel", channel);
    url.searchParams.set("parent", parent);
    url.searchParams.set("autoplay", autoplay ? "true" : "false");
    url.searchParams.set("muted", muted ? "true" : "false");
    // 你想要低延遲可加：url.searchParams.set("quality", "chunked");
    return url.toString();
  }, [parent, channel, autoplay, muted]);

  if (!src) {
    return (
      <div
        className="rounded-xl border flex items-center justify-center text-sm"
        style={{ borderColor: "var(--border)", height }}
      >
        載入播放器中…
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
      <iframe
        src={src}
        height={height}
        width="100%"
        allowFullScreen
        allow="autoplay; fullscreen"
        loading="lazy"
        title={`twitch-embed-${channel}`}
      />
    </div>
  );
}
