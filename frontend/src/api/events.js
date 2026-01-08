import api from "./axios";

export const getEvents = async () => {
  const { data } = await api.get("events/");
  return data;
};

export const getEvent = async (id) => {
  const { data } = await api.get(`events/${id}/`);
  return data;
};

export const createEvent = async (eventData) => {
  const { data } = await api.post("events/", eventData);
  return data;
};

export const updateEvent = async (id, eventData) => {
  const { data } = await api.put(`events/${id}/`, eventData);
  return data;
};

export const deleteEvent = async (id) => {
  await api.delete(`events/${id}/`);
};
