import api from "./axios";

export const getVoyages = async () => {
  const { data } = await api.get("voyages/");
  return data;
};

export const getVoyage = async (id) => {
  const { data } = await api.get(`voyages/${id}/`);
  return data;
};

export const createVoyage = async (voyageData) => {
  const { data } = await api.post("voyages/", voyageData);
  return data;
};

export const updateVoyage = async (id, voyageData) => {
  const { data } = await api.put(`voyages/${id}/`, voyageData);
  return data;
};

export const deleteVoyage = async (id) => {
  await api.delete(`voyages/${id}/`);
};
