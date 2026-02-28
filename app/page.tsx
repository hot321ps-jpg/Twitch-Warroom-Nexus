import StatCard from "@/components/StatCard";
import AlertBar from "@/components/AlertBar";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Twitch Warroom Nexus</h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            戰情室總控入口（戰情室 + 多頻道監控整合）
          </p>
        </div>
      </div>

      <AlertBar
        items={[
          { type: "info", text: "提示：你可以先到「多頻道監控」設定頻道清單，再回到「戰情室」看總覽。"},
          { type: "warn", text: "API 未設定 Twitch Token 時會回傳示範資料（便於先把 UI 跑起來）。"}
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="監控頻道數" value="—" hint="由 multi-monitor 的頻道清單決定" />
        <StatCard title="正在直播" value="—" hint="可由 /api/warroom-refresh 計算" />
        <StatCard title="異常事件" value="—" hint="掉線/突增/密度異常" />
      </div>

      <div className="rounded-2xl p-5 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <h2 className="text-lg font-semibold">下一步你可以做</h2>
        <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
          <li>• 在 <b>/multi-monitor</b> 輸入你的頻道清單（支援逗號分隔）</li>
          <li>• 回到 <b>/war-room</b> 看到總覽 KPI 與異常摘要</li>
          <li>• 之後把「自動告警」接到 Discord / LINE Notify / Webhook</li>
        </ul>
      </div>
    </div>
  );
}
