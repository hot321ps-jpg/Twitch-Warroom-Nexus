import type { ChannelSnapshot } from "@/types/twitch";

function env(name: string) {
  return process.env[name] || "";
}

/**
 * 若你有 Twitch Helix token：用真實 API
 * 沒有：回 mock，讓 UI 先跑起來
 */
export async function getChannelsSnapshot(logins: string[]): Promise<{ usedMock: boolean; channels: ChannelSnapshot[] }> {
  const clientId = env("TWITCH_CLIENT_ID");
  const token = env("TWITCH_APP_ACCESS_TOKEN");

  if (!clientId || !token) {
    return { usedMock: true, channels: mockSnapshot(logins) };
  }

  // Helix: Get Users by login -> 再用 user_id 查 streams
  const usersRes = await fetch(`https://api.twitch.tv/helix/users?${logins.map((l) => `login=${encodeURIComponent(l)}`).join("&")}`, {
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!usersRes.ok) {
    return { usedMock: true, channels: mockSnapshot(logins) };
  }

  const usersJson = await usersRes.json();
  const idByLogin = new Map<string, { id: string; display_name: string }>();
  for (const u of usersJson.data ?? []) idByLogin.set((u.login as string) ?? "", { id: u.id, display_name: u.display_name });

  const ids = [...idByLogin.values()].map((x) => x.id);
  const streamsRes = await fetch(`https://api.twitch.tv/helix/streams?${ids.map((id) => `user_id=${encodeURIComponent(id)}`).join("&")}`, {
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (!streamsRes.ok) {
    return { usedMock: true, channels: mockSnapshot(logins) };
  }

  const streamsJson = await streamsRes.json();
  const liveByLogin = new Map<string, any>();
  for (const s of streamsJson.data ?? []) liveByLogin.set(s.user_login, s);

  const channels: ChannelSnapshot[] = logins.map((login) => {
    const u = idByLogin.get(login);
    const live = liveByLogin.get(login);

    return {
      login,
      displayName: u?.display_name ?? login,
      isLive: Boolean(live),
      title: live?.title ?? "",
      category: live?.game_name ?? "",
      viewers: live?.viewer_count ?? 0,
      startedAt: live?.started_at ?? null
    };
  });

  return { usedMock: false, channels };
}

function mockSnapshot(logins: string[]): ChannelSnapshot[] {
  const now = Date.now();
  return logins.map((login, i) => {
    const live = i % 2 === 0;
    return {
      login,
      displayName: login,
      isLive: live,
      title: live ? "【示範】戰情室測試直播標題" : "",
      category: live ? "Just Chatting" : "",
      viewers: live ? 50 + i * 12 : 0,
      startedAt: live ? new Date(now - (20 + i * 7) * 60_000).toISOString() : null
    };
  });
}
