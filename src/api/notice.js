import { getPublishedNotices } from "@/api/noticeManagement";

export function getNoticeList() {
  return getPublishedNotices({ pageSize: 1 });
}
