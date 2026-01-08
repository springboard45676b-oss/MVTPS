import api from "./axios";

export const getVessels = async () => {
  const { data } = await api.get("vessels/");
  return data;
};

export const getVessel = async (id) => {
  const { data } = await api.get(`vessels/${id}/`);
  return data;
};

export const createVessel = async (vesselData) => {
  const { data } = await api.post("vessels/", vesselData);
  return data;
};

export const updateVessel = async (id, vesselData) => {
  const { data } = await api.put(`vessels/${id}/`, vesselData);
  return data;
};

export const deleteVessel = async (id) => {
  await api.delete(`vessels/${id}/`);
};

export const getVesselPositions = async (vesselId) => {
  const { data } = await api.get(`vessels/${vesselId}/positions/`);
  return data;
};

export const getVesselAlerts = async (vesselId) => {
  const { data } = await api.get(`vessels/${vesselId}/alerts/`);
  return data;
};

export const subscribeToVesselAlerts = async (vesselId, subscriptionData) => {
  const { data } = await api.post(`vessels/${vesselId}/subscribe/`, subscriptionData);
  return data;
};

export const unsubscribeFromVesselAlerts = async (vesselId) => {
  await api.delete(`vessels/${vesselId}/subscribe/`);
};

export const getVesselSubscriptions = async () => {
  const { data } = await api.get("vessels/subscriptions/");
  return data;
};
