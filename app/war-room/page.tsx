import { getChannelsSnapshot } from "@/lib/twitch";
import { detectAnomalies } from "@/lib/anomaly";

function parseChannels(value: unknown) {
  const raw =
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value.join(",")
        : "";

  return (raw || "wsx70529")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function WarRoomPage(props: any) {
  const channels = parseChannels(props?.searchParams?.channels);

  const snapshot = await getChannelsSnapshot(channels);
  const anomalies = detectAnomalies(snapshot.channels);

  const alerts = [
    ...(snapshot.usedMock
      ? [{ type: "warn", text: "未設定 Twitch API 憑證：目前使用示範資料（mock）。" }]
      : []),
    ...anomalies.alerts
  ];

  const data = {
    generatedAt: Date.now(),
    kpis: {
      totalViewers: snapshot.channels.reduce((a, c) => a + (c.viewers ?? 0), 0),
      anomalyCount: anomalies.alerts.length
    },
    alerts,
    channels: anomalies.channels
  };

  const online = data.channels.filter((c: any) => c.isLive).length;
  const total = data.channels.length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">戰情室</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            KPI 總覽 / 異常摘要 / 快速跳轉
          </p>
        </div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          更新時間：{new Date(data.generatedAt).toLocaleString("zh-TW")}
        </div>
      </div>

      <div className="space-y-2">
        {(data.alerts ?? []).map((a: any, i: number) => (
          <div
            key={i}
            className="rounded-2xl p-3 border text-sm"
            style={{
              borderColor: "var(--border)",
              background: "rgba(255,255,255,0.04)"
            }}
          >
            <span className="font-semibold">[{String(a.type).toUpperCase()}]</span>
            <span className="ml-2">{a.text}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--muted)" }}>監控頻道</div>
          <div className="mt-1 text-2xl font-semibold">{total}</div>
        </div>

        <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--muted)" }}>直播中</div>
          <div className="mt-1 text-2xl font-semibold">{online}</div>
        </div>

        <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--muted)" }}>總觀看（示範）</div>
          <div className="mt-1 text-2xl font-semibold">{data.kpis.totalViewers}</div>
        </div>

        <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
          <div className="text-sm" style={{ color: "var(--muted)" }}>異常事件</div>
          <div className="mt-1 text-2xl font-semibold">{data.kpis.anomalyCount}</div>
        </div>
      </div>

      <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="text-lg font-semibold">頻道摘要</h2>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.channels.map((c: any) => (
            <div key={c.login} className="rounded-2xl p-4 border" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{c.displayName}</div>
                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    @{c.login} · {c.isLive ? "直播中" : "離線"}
                  </div>
                </div>

                <div className="text-sm font-semibold" style={{ color: c.isLive ? "var(--ok)" : "var(--muted)" }}>
                  {c.isLive ? `${c.viewers} viewers` : "offline"}
                </div>
              </div>

              <div className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
                {c.isLive ? (c.title || "（無標題）") : "目前未開台"}
              </div>

              {c.flags?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {c.flags.map((f: string) => (
                    <span
                      key={f}
                      className="text-xs px-2 py-1 rounded-full border"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {f}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
