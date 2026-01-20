import { createContext, useContext, useState, useEffect } from "react";

const VoyageContext = createContext();

export function VoyageProvider({ children }) {

  // 🔹 Load from localStorage
  const [voyages, setVoyages] = useState(() => {
    const saved = localStorage.getItem("voyages");
    return saved ? JSON.parse(saved) : {};
  });

  // 🔹 Persist on change
  useEffect(() => {
    localStorage.setItem("voyages", JSON.stringify(voyages));
  }, [voyages]);

  const addVoyagePoint = (vesselId, point) => {
    setVoyages((prev) => ({
      ...prev,
      [vesselId]: [...(prev[vesselId] || []), {
        ...point,
        time: new Date().toLocaleString(),
      }],
    }));
  };

  return (
    <VoyageContext.Provider value={{ voyages, addVoyagePoint }}>
      {children}
    </VoyageContext.Provider>
  );
}

export const useVoyage = () => useContext(VoyageContext);
