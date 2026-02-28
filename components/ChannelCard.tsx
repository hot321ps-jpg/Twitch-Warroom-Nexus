export default function ChannelCard({ c }: { c: any }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
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
            <span key={f} className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: "var(--border)" }}>
              {f}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
