import { cache } from "react";
import { apiFetch } from "./api";
import { getSessionToken } from "./session";
import { DEFAULT_SETTINGS, SiteSettings, SettingsGroup } from "./settings-types";

type Stored = Partial<{ [G in SettingsGroup]: Partial<SiteSettings[G]> }>;


export const getSettings = cache(async (): Promise<SiteSettings> => {
  let stored: Stored = {};
  try {
    stored = await apiFetch<Stored>("/settings", { revalidate: 300 });
  } catch {
  }

  return {
    hero: { ...DEFAULT_SETTINGS.hero, ...stored.hero },
    contact: { ...DEFAULT_SETTINGS.contact, ...stored.contact },
    about: { ...DEFAULT_SETTINGS.about, ...stored.about },
    location: { ...DEFAULT_SETTINGS.location, ...stored.location },
    popup: { ...DEFAULT_SETTINGS.popup, ...stored.popup },
    finance: { ...DEFAULT_SETTINGS.finance, ...stored.finance },
    trust: {
      ...DEFAULT_SETTINGS.trust,
      ...stored.trust,
      points:
        Array.isArray(stored.trust?.points) && stored.trust.points.length > 0
          ? stored.trust.points
          : DEFAULT_SETTINGS.trust.points,
    },
  };
});


export async function updateSettings(group: SettingsGroup, data: unknown) {
  const token = await getSessionToken();
  return apiFetch<unknown>(`/settings/${group}`, { method: "PUT", body: data, token });
}
