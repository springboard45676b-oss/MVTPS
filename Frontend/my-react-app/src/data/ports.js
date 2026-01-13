const ports = [
  {
    id: 1,
    name: "Mumbai Port",
    country: "India",
    arrivals: 32,
    departures: 18,
    avgWait: "4.2 hrs",
    congestion: "High",
    location: [18.9647, 72.8258], // ✅ added
  },
  {
    id: 2,
    name: "Chennai Port",
    country: "India",
    arrivals: 14,
    departures: 20,
    avgWait: "1.5 hrs",
    congestion: "Low",
    location: [13.0827, 80.2707], // ✅ added
  },
  {
    id: 3,
    name: "Kolkata Port",
    country: "India",
    arrivals: 22,
    departures: 17,
    avgWait: "2.8 hrs",
    congestion: "Medium",
    location: [22.5726, 88.3639], // ✅ added
  },
  {
    id: 4,
    name: "Kochi Port",
    country: "India",
    arrivals: 10,
    departures: 15,
    avgWait: "1.2 hrs",
    congestion: "Low",
    location: [9.9312, 76.2673], // ✅ added
  },
];

export default ports;
