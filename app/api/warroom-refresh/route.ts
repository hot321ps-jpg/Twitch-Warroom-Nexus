import { NextResponse } from "next/server";
import { getChannelsSnapshot } from "@/lib/twitch";
import { detectAnomalies } from "@/lib/anomaly";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("channels");

  const channels = q
    ? q
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  // ✅ 沒輸入頻道就回空（維持乾淨）
  if (!channels.length) {
    return NextResponse.json({
      generatedAt: Date.now(),
      usedMock: false,
      kpis: { totalViewers: 0, anomalyCount: 0 },
      alerts: [],
      channels: []
    });
  }

  const snapshot = await getChannelsSnapshot(channels);
  const anomalies = detectAnomalies(snapshot.channels);

  // ✅ 商用：把後端 warnings 轉成前端 alerts
  const warnings = snapshot.warnings ?? [];
  const warnAlerts = warnings.map((w) => ({ type: "warn" as const, text: w }));

  const alerts = [...warnAlerts, ...anomalies.alerts];

  return NextResponse.json({
    generatedAt: Date.now(),
    usedMock: snapshot.usedMock,
    kpis: {
      totalViewers: snapshot.channels.reduce((a, c) => a + (c.viewers ?? 0), 0),
      anomalyCount: alerts.length
    },
    alerts,
    channels: anomalies.channels
  });
}
