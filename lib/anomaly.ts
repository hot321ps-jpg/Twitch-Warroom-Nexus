import type { ChannelSnapshot } from "@/types/twitch";

export function detectAnomalies(channels: ChannelSnapshot[]) {
  const alerts: { type: "info" | "warn" | "danger"; text: string }[] = [];

  // 規則示範：
  // 1) viewers 突增（> 800 當作示範門檻）
  // 2) 直播中但 viewers = 0（可能 API 異常或分類怪）
  // 3) 離線太多（> 70% 離線）提示密度問題
  const live = channels.filter((c) => c.isLive);
  const offline = channels.filter((c) => !c.isLive);

  const updated = channels.map((c) => {
    const flags: string[] = [];
    if (c.isLive && (c.viewers ?? 0) === 0) flags.push("LIVE_BUT_ZERO_VIEWERS");
    if ((c.viewers ?? 0) > 800) flags.push("VIEWERS_SPIKE");
    return { ...c, flags };
  });

  const spikeCount = updated.filter((c) => c.flags?.includes("VIEWERS_SPIKE")).length;
  if (spikeCount) alerts.push({ type: "danger", text: `偵測到 ${spikeCount} 個頻道觀看數突增（VIEWERS_SPIKE）。` });

  const zeroCount = updated.filter((c) => c.flags?.includes("LIVE_BUT_ZERO_VIEWERS")).length;
  if (zeroCount) alerts.push({ type: "warn", text: `有 ${zeroCount} 個頻道直播中但觀看數為 0（LIVE_BUT_ZERO_VIEWERS）。` });

  if (channels.length >= 3 && offline.length / channels.length > 0.7) {
    alerts.push({ type: "info", text: "目前多數頻道離線（>70%）。若這不符合預期，可能是頻道清單/Token/地區或查詢條件問題。" });
  }

  // 讓戰情室頁面也能提示目前 live/offline
  alerts.unshift({ type: "info", text: `直播中：${live.length} / ${channels.length}（離線：${offline.length}）` });

  return { alerts, channels: updated };
}
