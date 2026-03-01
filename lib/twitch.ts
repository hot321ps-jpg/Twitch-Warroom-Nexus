import type { ChannelSnapshot } from "@/types/twitch";

function env(name: string) {
  return process.env[name] || "";
}

export type SnapshotResult = {
  usedMock: boolean;
  channels: ChannelSnapshot[];
  warnings?: string[];
};

/**
 * 監看版策略
 * - 有 Twitch 憑證：用 Helix 真實抓資料（users + streams）
 * - 沒憑證：回「骨架資料」(每個 login 一張卡) + warnings
 *   讓 UI 仍可顯示並可用 iframe 監看（不顯示即時數據）
 */
export async function getChannelsSnapshot(logins: string[]): Promise<SnapshotResult> {
  const clientId = env("TWITCH_CLIENT_ID");
  const token = env("TWITCH_APP_ACCESS_TOKEN");

  if (!logins?.length) {
    return { usedMock: false, channels: [] };
  }

  // ✅ 沒憑證：回骨架資料（可監看）
  if (!clientId || !token) {
    return {
      usedMock: true,
      channels: logins.map((login) => ({
        login,
        displayName: login,
        isLive: false,
        title: "",
        category: "",
        viewers: 0,
        startedAt: null
      })),
      warnings: ["未設定 Twitch API 憑證：目前僅提供播放器監看（不顯示即時數據）。"]
    };
  }

  try {
    // Helix: Get Users by login
    const usersUrl = `https://api.twitch.tv/helix/users?${logins
      .map((l) => `login=${encodeURIComponent(l)}`)
      .join("&")}`;

    const usersRes = await fetch(usersUrl, {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!usersRes.ok) {
      // ✅ API 失敗：也回骨架資料，至少能監看
      return {
        usedMock: true,
        channels: logins.map((login) => ({
          login,
          displayName: login,
          isLive: false,
          title: "",
          category: "",
          viewers: 0,
          startedAt: null
        })),
        warnings: [`Helix users request failed: ${usersRes.status}（已切換監看模式）`]
      };
    }

    const usersJson = await usersRes.json();
    const idByLogin = new Map<string, { id: string; display_name: string }>();

    for (const u of usersJson.data ?? []) {
      if (u?.login && u?.id) idByLogin.set(u.login, { id: u.id, display_name: u.display_name });
    }

    const ids = [...idByLogin.values()].map((x) => x.id);

    // ✅ users 查不到人：回骨架
    if (!ids.length) {
      return {
        usedMock: true,
        channels: logins.map((login) => ({
          login,
          displayName: login,
          isLive: false,
          title: "",
          category: "",
          viewers: 0,
          startedAt: null
        })),
        warnings: ["查不到該 login（或帳號不存在/拼錯），已切換監看模式"]
      };
    }

    // Helix: streams by user_id
    const streamsUrl = `https://api.twitch.tv/helix/streams?${ids
      .map((id) => `user_id=${encodeURIComponent(id)}`)
      .join("&")}`;

    const streamsRes = await fetch(streamsUrl, {
      headers: {
        "Client-ID": clientId,
        Authorization: `Bearer ${token}`
      },
      cache: "no-store"
    });

    if (!streamsRes.ok) {
      return {
        usedMock: true,
        channels: logins.map((login) => {
          const u = idByLogin.get(login);
          return {
            login,
            displayName: u?.display_name ?? login,
            isLive: false,
            title: "",
            category: "",
            viewers: 0,
            startedAt: null
          };
        }),
        warnings: [`Helix streams request failed: ${streamsRes.status}（已切換監看模式）`]
      };
    }

    const streamsJson = await streamsRes.json();
    const liveByLogin = new Map<string, any>();
    for (const s of streamsJson.data ?? []) {
      if (s?.user_login) liveByLogin.set(s.user_login, s);
    }

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
  } catch (err: any) {
    // ✅ 例外：回骨架
    return {
      usedMock: true,
      channels: logins.map((login) => ({
        login,
        displayName: login,
        isLive: false,
        title: "",
        category: "",
        viewers: 0,
        startedAt: null
      })),
      warnings: [`Unexpected error（已切換監看模式）: ${String(err?.message ?? err)}`]
    };
  }
}
