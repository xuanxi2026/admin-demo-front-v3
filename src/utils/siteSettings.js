import { title as defaultTitle } from "@/config";
import { fetchSettingsByGroup } from "@/api/systemSettings";

export const SITE_SETTINGS_KEY = "admin-demo-site-settings";
export const SITE_SETTINGS_EVENT = "site-settings:updated";

export function readSiteSettings() {
  try {
    const raw = localStorage.getItem(SITE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    return {};
  }
}

export function getRuntimeTitle() {
  return readSiteSettings().siteName || window.$baseTitle || defaultTitle;
}

export function getRuntimeLogo() {
  return readSiteSettings().logo || "";
}

export function applySiteSettings(settings = {}) {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
  window.$baseTitle = settings.siteName || defaultTitle;
  window.$eventBus?.emit(SITE_SETTINGS_EVENT, settings);
}

export async function refreshSiteSettings() {
  const meta = await fetchSettingsByGroup("site");
  const settings = {
    siteName: meta["site.title"]?.configValue || defaultTitle,
    description: meta["site.description"]?.configValue || "",
    logo: meta["site.logo"]?.configValue || "",
    maintenanceMode: String(meta["site.maintenance_mode"]?.configValue) === "true",
  };
  applySiteSettings(settings);
  return settings;
}
