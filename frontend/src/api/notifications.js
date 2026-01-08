import api from "./axios";

export const getNotifications = async () => {
  const { data } = await api.get("notifications/");
  return data;
};

export const markNotificationAsRead = async (id) => {
  const { data } = await api.patch(`notifications/${id}/mark-read/`);
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data } = await api.post("notifications/mark-all-read/");
  return data;
};

export const deleteNotification = async (id) => {
  await api.delete(`notifications/${id}/`);
};

export const getUnreadCount = async () => {
  const { data } = await api.get("notifications/unread-count/");
  return data;
};
