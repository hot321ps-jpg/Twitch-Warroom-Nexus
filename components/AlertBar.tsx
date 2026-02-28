export default function AlertBar({
  items
}: {
  items: { type: "info" | "warn" | "danger"; text: string }[];
}) {
  if (!items?.length) return null;

  const color = (t: string) => {
    if (t === "danger") return "var(--danger)";
    if (t === "warn") return "var(--accent)";
    return "var(--ok)";
  };

  return (
    <div className="space-y-2">
      {items.map((it, idx) => (
        <div
          key={idx}
          className="rounded-2xl p-3 border text-sm"
          style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.04)" }}
        >
          <span className="font-semibold" style={{ color: color(it.type) }}>
            {it.type.toUpperCase()}
          </span>
          <span className="ml-2" style={{ color: "var(--text)" }}>{it.text}</span>
        </div>
      ))}
    </div>
  );
}
