import api from "./axios";

export const getPorts = async () => {
  const { data } = await api.get("ports/");
  return data;
};

export const getPort = async (id) => {
  const { data } = await api.get(`ports/${id}/`);
  return data;
};

export const createPort = async (portData) => {
  const { data } = await api.post("ports/", portData);
  return data;
};

export const updatePort = async (id, portData) => {
  const { data } = await api.put(`ports/${id}/`, portData);
  return data;
};

export const deletePort = async (id) => {
  await api.delete(`ports/${id}/`);
};
