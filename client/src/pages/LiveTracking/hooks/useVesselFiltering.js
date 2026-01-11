// src/pages/liveTracking/hooks/useVesselFiltering.js
import { useState, useEffect } from 'react';

export const useVesselFiltering = (vessels, searchQuery, filters, countries) => {
  const [filteredVessels, setFilteredVessels] = useState([]);

  useEffect(() => {
    let filtered = vessels;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.imo_number && v.imo_number.includes(searchQuery))
      );
    }

    // Type filter
    if (filters.types && filters.types.length > 0) {
      filtered = filtered.filter(v => {
        if (!v.type) return false;
        const vesselType = v.type.toLowerCase();
        return filters.types.some(filterType => 
          vesselType.includes(filterType.toLowerCase())
        );
      });
    }

    // Continent filter
    if (filters.continents && filters.continents.length > 0) {
      filtered = filtered.filter(v => {
        if (!v.flag) return false;
        const country = countries.find(c => c.name === v.flag);
        if (!country) return false;
        return filters.continents.includes(country.continent);
      });
    }

    // Speed range filter
    if (filters.speedRange) {
      filtered = filtered.filter(v => {
        if (!v.speed && v.speed !== 0) return true;
        return v.speed >= filters.speedRange[0] && v.speed <= filters.speedRange[1];
      });
    }

    setFilteredVessels(filtered);
  }, [searchQuery, filters, vessels, countries]);

  return filteredVessels;
};