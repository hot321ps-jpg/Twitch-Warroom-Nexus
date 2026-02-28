import Link from "next/link";

const items = [
  { href: "/", label: "中樞" },
  { href: "/war-room", label: "戰情室" },
  { href: "/multi-monitor", label: "多頻道監控" }
];

export default function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b backdrop-blur" style={{ borderColor: "var(--border)", background: "rgba(11,11,15,0.6)" }}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="font-semibold">Twitch Warroom Nexus</div>
        <nav className="flex items-center gap-2">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-sm px-3 py-1.5 rounded-full border hover:opacity-90"
              style={{ borderColor: "var(--border)" }}
            >
              {it.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
