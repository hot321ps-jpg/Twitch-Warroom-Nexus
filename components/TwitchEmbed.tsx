"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function TwitchEmbed({
  channel,
  autoplay = true,
  muted = true,
  height = 240,
  rootMargin = "200px"
}: {
  channel: string;
  autoplay?: boolean;
  muted?: boolean;
  height?: number;
  rootMargin?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [parent, setParent] = useState<string>("");
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setParent(window.location.hostname);
  }, []);

  // ✅ 懶載入：進入視窗（含預載 rootMargin）才開始真正建立 iframe
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    // 已載入就不再觀察
    if (loaded) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { root: null, threshold: 0.01, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [rootMargin, loaded]);

  const src = useMemo(() => {
    if (!parent) return "";
    const url = new URL("https://player.twitch.tv/");
    url.searchParams.set("channel", channel);
    url.searchParams.set("parent", parent);
    url.searchParams.set("autoplay", autoplay ? "true" : "false");
    url.searchParams.set("muted", muted ? "true" : "false");
    return url.toString();
  }, [parent, channel, autoplay, muted]);

  return (
    <div
      ref={wrapRef}
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)" }}
    >
      {/* 先顯示骨架，進入視窗才載入 iframe */}
      {!inView || !src ? (
        <div
          className="flex items-center justify-center text-sm"
          style={{ height, color: "var(--muted)", background: "rgba(255,255,255,0.03)" }}
        >
          播放器待命中（滑到這張卡片會自動載入）
        </div>
      ) : (
        <iframe
          src={src}
          height={height}
          width="100%"
          allowFullScreen
          allow="autoplay; fullscreen"
          loading="lazy"
          title={`twitch-embed-${channel}`}
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
