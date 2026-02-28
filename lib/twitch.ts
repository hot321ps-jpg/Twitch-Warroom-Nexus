import type { ChannelSnapshot } from "@/types/twitch";

function env(name: string) {
  return process.env[name] || "";
}

export type SnapshotResult = {
  usedMock: boolean;              // 保留欄位，商用版永遠 false（除非你未來想開 demo 模式）
  channels: ChannelSnapshot[];
  warnings?: string[];            // ✅ 商用：把抓取失敗原因回報給上層顯示
};

/**
 * 商用版策略
 * - 沒有 Twitch 憑證：回空（不產生 mock）
 * - API 失敗：回空 + warnings（不產生 mock）
 * - logins 空：回空
 */
export async function getChannelsSnapshot(logins: string[]): Promise<SnapshotResult> {
  const clientId = env("TWITCH_CLIENT_ID");
  const token = env("TWITCH_APP_ACCESS_TOKEN");

  // ✅ 沒有頻道就直接回空
  if (!logins?.length) {
    return { usedMock: false, channels: [] };
  }

  // ✅ 沒有憑證就回空（維持乾淨）
  if (!clientId || !token) {
    return {
      usedMock: false,
      channels: [],
      warnings: ["Missing TWITCH_CLIENT_ID / TWITCH_APP_ACCESS_TOKEN"]
    };
  }

  try {
    // Helix: users by login
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
      return {
        usedMock: false,
        channels: [],
        warnings: [`Helix users request failed: ${usersRes.status}`]
      };
    }

    const usersJson = await usersRes.json();
    const idByLogin = new Map<string, { id: string; display_name: string }>();

    for (const u of usersJson.data ?? []) {
      if (u?.login && u?.id) idByLogin.set(u.login, { id: u.id, display_name: u.display_name });
    }

    const ids = [...idByLogin.values()].map((x) => x.id);

    // ✅ users 查不到任何人（login 打錯 or 不存在）→ 回空但給 warning
    if (!ids.length) {
      return {
        usedMock: false,
        channels: [],
        warnings: ["No users found for provided logins"]
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
        usedMock: false,
        channels: [],
        warnings: [`Helix streams request failed: ${streamsRes.status}`]
      };
    }

    const streamsJson = await streamsRes.json();
    const liveByLogin = new Map<string, any>();
    for (const s of streamsJson.data ?? []) {
      if (s?.user_login) liveByLogin.set(s.user_login, s);
    }

    // ✅ 組合結果：維持 logins 原順序
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
    return {
      usedMock: false,
      channels: [],
      warnings: [`Unexpected error: ${String(err?.message ?? err)}`]
    };
  }
}
