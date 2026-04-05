import { getPublishedNotices } from "@/api/noticeManagement";

export const NOTICE_READ_KEY = "admin-demo-notice-read-ids";
export const NOTICE_EVENT = "notice-center:updated";

export function loadReadIds() {
  try {
    const raw = localStorage.getItem(NOTICE_READ_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

export function persistReadIds(ids = []) {
  localStorage.setItem(NOTICE_READ_KEY, JSON.stringify(ids));
}

export function emitNoticeChange(payload = {}) {
  window.$eventBus?.emit(NOTICE_EVENT, payload);
}

export function buildNotifications(rows = [], readIds = []) {
  return rows.map((item) => ({
    id: item.id,
    title: item.title,
    content: item.content,
    sender: item.publisher || "系统公告",
    date: item.datatime,
    level: item.level,
    status: item.status,
    read: readIds.includes(item.id),
  }));
}

export async function fetchPublishedNotifications(params = {}) {
  const readIds = loadReadIds();
  const { data } = await getPublishedNotices({ pageSize: 50, ...params });
  const notifications = buildNotifications(data || [], readIds);
  return {
    notifications,
    unreadCount: notifications.filter((item) => !item.read).length,
  };
}
