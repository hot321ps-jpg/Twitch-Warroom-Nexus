import { NextResponse } from "next/server";
import { getChannelsSnapshot } from "@/lib/twitch";
import { detectAnomalies } from "@/lib/anomaly";

export async function GET(req: Request) {
  const url = new URL(req.url);

  // 允許從 query 指定 channels（不指定就用預設/示範）
  const q = url.searchParams.get("channels");
  const channels = (q ? q.split(",") : ["wsx70529"]).map((s) => s.trim()).filter(Boolean);

  const snapshot = await getChannelsSnapshot(channels);
  const anomalies = detectAnomalies(snapshot.channels);

  const alerts = [
    ...(snapshot.usedMock ? [{ type: "warn", text: "未設定 Twitch API 憑證：目前使用示範資料（mock）。" }] : []),
    ...anomalies.alerts
  ];

  return NextResponse.json({
    generatedAt: Date.now(),
    usedMock: snapshot.usedMock,
    kpis: {
      totalViewers: snapshot.channels.reduce((a, c) => a + (c.viewers ?? 0), 0),
      anomalyCount: anomalies.alerts.length
    },
    alerts,
    channels: anomalies.channels
  });
}
