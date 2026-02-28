export default function StatCard({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl p-4 border" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
      <div className="text-sm" style={{ color: "var(--muted)" }}>{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-2 text-xs" style={{ color: "var(--muted)" }}>{hint}</div> : null}
    </div>
  );
}
