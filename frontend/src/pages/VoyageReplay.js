import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../services/api';
import { toast } from 'react-toastify';

// Custom vessel icon with direction
const createVesselIcon = (course = 0, isPlaying = false) => {
  const color = isPlaying ? '#ff4444' : '#0066cc';
  const svgIcon = `
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${course} 10 10)">
        <path d="M10 2 L14 16 L10 13 L6 16 Z" fill="${color}" stroke="white" stroke-width="1"/>
      </g>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'vessel-replay-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const VoyageReplay = () => {
  const [vessels, setVessels] = useState([]);
  const [selectedVessel, setSelectedVessel] = useState(null);
  const [voyageData, setVoyageData] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [complianceMode, setComplianceMode] = useState(false);
  const [weatherOverlay, setWeatherOverlay] = useState(false);
  
  const intervalRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetchVessels();
  }, []);

  useEffect(() => {
    if (selectedVessel) {
      fetchVoyageData(selectedVessel.id);
    }
  }, [selectedVessel]);

  useEffect(() => {
    if (isPlaying && voyageData.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentPosition(prev => {
          const next = prev + 1;
          if (next >= voyageData.length) {
            setIsPlaying(false);
            return voyageData.length - 1;
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, playbackSpeed, voyageData.length]);

  const fetchVessels = async () => {
    try {
      const response = await api.get('/vessels/');
      setVessels(response.data.results || response.data);
    } catch (error) {
      // Fallback to sample data if backend is not available
      console.log('Backend not available, using sample data');
      const sampleVessels = [
        { id: 1, name: 'EVER GIVEN', mmsi: '353136000', vessel_type: 'Container Ship' },
        { id: 2, name: 'WONDER OF THE SEAS', mmsi: '248663000', vessel_type: 'Passenger Ship' },
        { id: 3, name: 'MAERSK ESSEX', mmsi: '219018671', vessel_type: 'Container Ship' },
        { id: 4, name: 'COSCO SHIPPING', mmsi: '477995300', vessel_type: 'Cargo Ship' },
        { id: 5, name: 'MSC GULSUN', mmsi: '636019825', vessel_type: 'Container Ship' }
      ];
      setVessels(sampleVessels);
    } finally {
      setLoading(false);
    }
  };

  const fetchVoyageData = async (vesselId) => {
    try {
      setLoading(true);
      
      // Try to fetch from backend first
      try {
        const response = await api.get(`/vessels/${vesselId}/track/`);
        const positions = response.data.positions || [];
        
        if (positions.length > 0) {
          // Sort by timestamp and add compliance data
          const sortedPositions = positions
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            .map((pos, index) => ({
              ...pos,
              index,
              compliance: analyzeCompliance(pos, index, positions)
            }));
          
          setVoyageData(sortedPositions);
          setCurrentPosition(0);
          
          if (sortedPositions.length > 0) {
            // Center map on voyage start
            const firstPos = sortedPositions[0];
            if (mapRef.current) {
              mapRef.current.setView([firstPos.latitude, firstPos.longitude], 8);
            }
          }
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, using sample voyage data');
      }
      
      // Fallback to sample voyage data
      const sampleVoyageData = generateSampleVoyageData(vesselId);
      const sortedPositions = sampleVoyageData.map((pos, index) => ({
        ...pos,
        index,
        compliance: analyzeCompliance(pos, index, sampleVoyageData)
      }));
      
      setVoyageData(sortedPositions);
      setCurrentPosition(0);
      
      if (sortedPositions.length > 0) {
        // Center map on voyage start
        const firstPos = sortedPositions[0];
        if (mapRef.current) {
          mapRef.current.setView([firstPos.latitude, firstPos.longitude], 8);
        }
      }
      
    } catch (error) {
      toast.error('Failed to load voyage data');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample voyage data for demo purposes
  const generateSampleVoyageData = (vesselId) => {
    console.log('🚢 Generating voyage data for vessel ID:', vesselId, typeof vesselId);
    
    const baseDate = new Date('2024-03-15T08:00:00Z');
    const positions = [];
    
    // Convert vesselId to number to ensure proper matching
    const id = parseInt(vesselId);
    console.log('🔢 Converted vessel ID:', id);
    
    // Different realistic routes based on vessel ID and type
    const routes = {
      1: { // EVER GIVEN - Container Ship (Suez Canal incident recreation)
        start: { lat: 30.0131, lng: 32.5920 }, // Suez Canal entrance
        waypoints: [
          { lat: 30.0444, lng: 32.3417 }, // Suez Canal
          { lat: 31.2590, lng: 32.3010 }, // Port Said
          { lat: 35.1264, lng: 25.1289 }, // Crete
          { lat: 36.7783, lng: 3.0586 },  // Algiers
          { lat: 43.2965, lng: 5.3698 }   // Marseille
        ],
        end: { lat: 51.8985, lng: 4.4036 },   // Rotterdam
        name: 'Suez Canal to Rotterdam',
        baseSpeed: 22,
        violations: [15, 32] // Positions with speed violations
      },
      2: { // WONDER OF THE SEAS - Cruise Ship (Caribbean Circuit)
        start: { lat: 25.7617, lng: -80.1918 }, // Miami
        waypoints: [
          { lat: 24.5557, lng: -81.7821 }, // Key West
          { lat: 21.3099, lng: -157.8581 }, // Honolulu (wrong - fixing)
          { lat: 20.2991, lng: -87.9654 }, // Cozumel
          { lat: 18.4655, lng: -69.9312 }, // Dominican Republic
          { lat: 17.9714, lng: -76.7931 }  // Jamaica
        ],
        end: { lat: 18.2208, lng: -66.5901 },   // San Juan
        name: 'Caribbean Cruise Circuit',
        baseSpeed: 16,
        violations: [25] // One speed violation
      },
      3: { // MAERSK ESSEX - Container Ship (Trans-Pacific)
        start: { lat: 37.7749, lng: -122.4194 }, // San Francisco
        waypoints: [
          { lat: 21.3099, lng: -157.8581 }, // Honolulu
          { lat: 13.4443, lng: 144.7937 }, // Guam
          { lat: 14.5995, lng: 120.9842 }, // Manila
          { lat: 22.3193, lng: 114.1694 }, // Hong Kong
          { lat: 31.2304, lng: 121.4737 }  // Shanghai
        ],
        end: { lat: 35.6762, lng: 139.6503 },    // Tokyo
        name: 'Trans-Pacific Container Route',
        baseSpeed: 20,
        violations: [18, 35, 42] // Multiple violations
      },
      4: { // COSCO SHIPPING - Cargo Ship (Asia-Europe via Suez)
        start: { lat: 31.2304, lng: 121.4737 }, // Shanghai
        waypoints: [
          { lat: 22.3193, lng: 114.1694 }, // Hong Kong
          { lat: 1.2966, lng: 103.7764 },  // Singapore
          { lat: 18.9388, lng: 72.8354 },  // Mumbai
          { lat: 25.2048, lng: 55.2708 },  // Dubai
          { lat: 29.3759, lng: 47.9774 }   // Kuwait
        ],
        end: { lat: 53.5511, lng: 9.9937 },     // Hamburg
        name: 'Asia-Europe Trade Lane',
        baseSpeed: 19,
        violations: [12, 28] // Two violations
      },
      5: { // MSC GULSUN - Container Ship (Mediterranean)
        start: { lat: 36.8969, lng: 30.7133 }, // Antalya
        waypoints: [
          { lat: 35.1264, lng: 25.1289 }, // Crete
          { lat: 37.9755, lng: 23.7348 }, // Athens
          { lat: 40.6401, lng: 22.9444 }, // Thessaloniki
          { lat: 45.4408, lng: 12.3155 }, // Venice
          { lat: 43.7696, lng: 11.2558 }  // Florence
        ],
        end: { lat: 43.2965, lng: 5.3698 },   // Marseille
        name: 'Mediterranean Container Route',
        baseSpeed: 18,
        violations: [20] // One violation
      }
    };
    
    const route = routes[id];
    console.log('🗺️ Selected route for ID', id, ':', route ? route.name : 'NOT FOUND - using default');
    
    // Use default route if vessel ID not found
    const selectedRoute = route || routes[1];
    console.log('📍 Final route:', selectedRoute.name);
    
    const numPositions = 60; // More positions for better detail
    
    // Create all waypoints including start and end
    const allWaypoints = [selectedRoute.start, ...selectedRoute.waypoints, selectedRoute.end];
    console.log('🛤️ Route waypoints:', allWaypoints.length, 'waypoints for', selectedRoute.name);
    
    // Calculate positions along the route
    for (let i = 0; i < numPositions; i++) {
      const progress = i / (numPositions - 1);
      const totalSegments = allWaypoints.length - 1;
      const segmentProgress = progress * totalSegments;
      const segmentIndex = Math.floor(segmentProgress);
      const segmentLocalProgress = segmentProgress - segmentIndex;
      
      let lat, lng;
      
      if (segmentIndex >= totalSegments) {
        // Last position
        lat = allWaypoints[allWaypoints.length - 1].lat;
        lng = allWaypoints[allWaypoints.length - 1].lng;
      } else {
        // Interpolate between waypoints
        const startPoint = allWaypoints[segmentIndex];
        const endPoint = allWaypoints[segmentIndex + 1];
        
        lat = startPoint.lat + (endPoint.lat - startPoint.lat) * segmentLocalProgress;
        lng = startPoint.lng + (endPoint.lng - startPoint.lng) * segmentLocalProgress;
      }
      
      // Add realistic variation
      const latVariation = (Math.random() - 0.5) * 0.005;
      const lngVariation = (Math.random() - 0.5) * 0.005;
      
      const timestamp = new Date(baseDate.getTime() + i * 45 * 60 * 1000); // 45 minutes apart
      
      // Generate realistic speed with violations at specific positions
      let speed = selectedRoute.baseSpeed + (Math.random() - 0.5) * 4; // ±2 knots variation
      
      if (selectedRoute.violations.includes(i)) {
        speed = 26 + Math.random() * 3; // Speed violation (26-29 knots)
      }
      
      // Calculate course between current and next position
      let course = 0;
      if (i < numPositions - 1) {
        const nextProgress = (i + 1) / (numPositions - 1);
        const nextSegmentProgress = nextProgress * totalSegments;
        const nextSegmentIndex = Math.floor(nextSegmentProgress);
        const nextSegmentLocalProgress = nextSegmentProgress - nextSegmentIndex;
        
        let nextLat, nextLng;
        if (nextSegmentIndex >= totalSegments) {
          nextLat = allWaypoints[allWaypoints.length - 1].lat;
          nextLng = allWaypoints[allWaypoints.length - 1].lng;
        } else {
          const nextStartPoint = allWaypoints[nextSegmentIndex];
          const nextEndPoint = allWaypoints[nextSegmentIndex + 1];
          nextLat = nextStartPoint.lat + (nextEndPoint.lat - nextStartPoint.lat) * nextSegmentLocalProgress;
          nextLng = nextStartPoint.lng + (nextEndPoint.lng - nextStartPoint.lng) * nextSegmentLocalProgress;
        }
        
        const deltaLat = nextLat - lat;
        const deltaLng = nextLng - lng;
        course = (Math.atan2(deltaLng, deltaLat) * 180 / Math.PI + 360) % 360;
      }
      
      // Add course variation and sudden changes for violations
      const courseVariation = (Math.random() - 0.5) * 10;
      let finalCourse = course + courseVariation;
      
      // Add sudden course changes at specific positions
      if (i === 25 || i === 45) {
        finalCourse += (Math.random() > 0.5 ? 1 : -1) * (90 + Math.random() * 30); // 90-120 degree change
      }
      
      finalCourse = (finalCourse + 360) % 360;
      
      positions.push({
        latitude: parseFloat((lat + latVariation).toFixed(6)),
        longitude: parseFloat((lng + lngVariation).toFixed(6)),
        speed: parseFloat(speed.toFixed(1)),
        course: parseFloat(finalCourse.toFixed(0)),
        heading: parseFloat(finalCourse.toFixed(0)),
        status: speed < 1 ? 'At anchor' : 'Under way using engine',
        timestamp: timestamp.toISOString()
      });
    }
    
    console.log('✅ Generated', positions.length, 'positions for', selectedRoute.name);
    console.log('📍 First position:', positions[0]?.latitude, positions[0]?.longitude);
    console.log('📍 Last position:', positions[positions.length - 1]?.latitude, positions[positions.length - 1]?.longitude);
    
    return positions;
  };

  const analyzeCompliance = (position, index, allPositions) => {
    const issues = [];
    
    // Speed compliance (example: max 25 knots in certain areas)
    if (position.speed > 25) {
      issues.push({
        type: 'speed_violation',
        severity: 'high',
        message: `Speed ${position.speed.toFixed(1)} knots exceeds limit of 25 knots`
      });
    }
    
    // Course deviation (example: sudden course changes > 90 degrees)
    if (index > 0) {
      const prevPosition = allPositions[index - 1];
      const courseDiff = Math.abs(position.course - prevPosition.course);
      if (courseDiff > 90 && courseDiff < 270) {
        issues.push({
          type: 'course_deviation',
          severity: 'medium',
          message: `Sudden course change: ${courseDiff.toFixed(0)}°`
        });
      }
    }
    
    // AIS transmission gaps (example: > 30 minutes between positions)
    if (index > 0) {
      const prevPosition = allPositions[index - 1];
      const timeDiff = (new Date(position.timestamp) - new Date(prevPosition.timestamp)) / (1000 * 60);
      if (timeDiff > 30) {
        issues.push({
          type: 'ais_gap',
          severity: 'medium',
          message: `AIS transmission gap: ${timeDiff.toFixed(0)} minutes`
        });
      }
    }
    
    return {
      issues,
      score: Math.max(0, 100 - (issues.length * 20)), // Simple scoring
      status: issues.length === 0 ? 'compliant' : issues.some(i => i.severity === 'high') ? 'violation' : 'warning'
    };
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
  };

  const handlePositionChange = (position) => {
    setCurrentPosition(parseInt(position));
    setIsPlaying(false);
  };

  // Helper function to get route name for display
  const getRouteName = (vesselId) => {
    const id = parseInt(vesselId);
    const routeNames = {
      1: 'Suez Canal to Rotterdam',
      2: 'Caribbean Cruise Circuit', 
      3: 'Trans-Pacific Container Route',
      4: 'Asia-Europe Trade Lane',
      5: 'Mediterranean Container Route'
    };
    return routeNames[id] || 'Suez Canal to Rotterdam (Default)';
  };

  const jumpToCompliance = (type) => {
    const violationIndex = voyageData.findIndex(pos => 
      pos.compliance.issues.some(issue => issue.type === type)
    );
    if (violationIndex !== -1) {
      setCurrentPosition(violationIndex);
      setIsPlaying(false);
    }
  };

  const exportComplianceReport = () => {
    const report = {
      vessel: selectedVessel,
      voyage_period: {
        start: voyageData[0]?.timestamp,
        end: voyageData[voyageData.length - 1]?.timestamp
      },
      compliance_summary: {
        total_positions: voyageData.length,
        violations: voyageData.filter(p => p.compliance.status === 'violation').length,
        warnings: voyageData.filter(p => p.compliance.status === 'warning').length,
        average_score: voyageData.reduce((sum, p) => sum + p.compliance.score, 0) / voyageData.length
      },
      detailed_issues: voyageData
        .filter(p => p.compliance.issues.length > 0)
        .map(p => ({
          timestamp: p.timestamp,
          position: [p.latitude, p.longitude],
          speed: p.speed,
          course: p.course,
          issues: p.compliance.issues
        }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compliance_report_${selectedVessel.name}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentPos = voyageData[currentPosition];
  const voyagePath = voyageData.slice(0, currentPosition + 1).map(pos => [pos.latitude, pos.longitude]);

  if (loading) {
    return <div className="loading">Loading voyage replay...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: '0.5rem' }}>
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>🎞️ Voyage Replay</h1>
        <p style={{ fontSize: '0.9rem', margin: '0' }}>Replay vessel voyages for compliance analysis and investigation</p>
      </div>

      {/* Vessel Selection */}
      <div className="card">
        <h2>Select Vessel</h2>
        <div className="vessel-selection">
          <select 
            className="form-control"
            value={selectedVessel?.id || ''}
            onChange={(e) => {
              const vessel = vessels.find(v => v.id === parseInt(e.target.value));
              setSelectedVessel(vessel);
            }}
          >
            <option value="">Choose a vessel...</option>
            {vessels.map(vessel => (
              <option key={vessel.id} value={vessel.id}>
                {vessel.name} ({vessel.mmsi}) - {vessel.vessel_type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedVessel && (
        <div className="card">
          <div className="vessel-info">
            <h2>Selected Vessel: {selectedVessel.name}</h2>
            <p><strong>MMSI:</strong> {selectedVessel.mmsi} | <strong>Type:</strong> {selectedVessel.vessel_type}</p>
            {loading && <p>🔄 Loading voyage data...</p>}
            {!loading && voyageData.length === 0 && <p>❌ No voyage data available for this vessel.</p>}
            {!loading && voyageData.length > 0 && (
              <p>✅ <strong>Route:</strong> {getRouteName(selectedVessel.id)} | <strong>Positions:</strong> {voyageData.length}</p>
            )}
          </div>
        </div>
      )}

      {selectedVessel && voyageData.length > 0 && (
        <>
          {/* Playback Controls */}
          <div className="card">
            <div className="playback-controls">
              <div className="control-group">
                <h3>Playback Controls</h3>
                <div className="controls-row">
                  <button 
                    className={`btn ${isPlaying ? 'btn-danger' : 'btn-primary'}`}
                    onClick={handlePlay}
                  >
                    {isPlaying ? '⏸️ Pause' : '▶️ Play'}
                  </button>
                  
                  <div className="speed-controls">
                    <label>Speed:</label>
                    {[0.5, 1, 2, 5, 10].map(speed => (
                      <button
                        key={speed}
                        className={`btn btn-sm ${playbackSpeed === speed ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => handleSpeedChange(speed)}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>

                  <div className="mode-toggles">
                    <label>
                      <input
                        type="checkbox"
                        checked={complianceMode}
                        onChange={(e) => setComplianceMode(e.target.checked)}
                      />
                      Compliance Mode
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={weatherOverlay}
                        onChange={(e) => setWeatherOverlay(e.target.checked)}
                      />
                      Weather Overlay
                    </label>
                  </div>
                </div>
              </div>

              {/* Timeline Scrubber */}
              <div className="timeline-scrubber">
                <div className="timeline-info">
                  <span>Position {currentPosition + 1} of {voyageData.length}</span>
                  <span>{currentPos?.timestamp && new Date(currentPos.timestamp).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={voyageData.length - 1}
                  value={currentPosition}
                  onChange={(e) => handlePositionChange(e.target.value)}
                  className="timeline-slider"
                />
                <div className="timeline-markers">
                  {voyageData.map((pos, index) => (
                    <div
                      key={index}
                      className={`timeline-marker ${pos.compliance.status}`}
                      style={{ left: `${(index / (voyageData.length - 1)) * 100}%` }}
                      title={`${pos.compliance.status} - ${pos.compliance.issues.length} issues`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Current Position Info */}
          {currentPos && (
            <div className="card">
              <div className="position-info">
                <div className="info-grid">
                  <div className="info-item">
                    <label>Speed</label>
                    <span className={currentPos.speed > 25 ? 'violation' : ''}>{currentPos.speed?.toFixed(1) || 'N/A'} knots</span>
                  </div>
                  <div className="info-item">
                    <label>Course</label>
                    <span>{currentPos.course?.toFixed(0) || 'N/A'}°</span>
                  </div>
                  <div className="info-item">
                    <label>Status</label>
                    <span>{currentPos.status || 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <label>Compliance Score</label>
                    <span className={`compliance-score ${currentPos.compliance.status}`}>
                      {currentPos.compliance.score}/100
                    </span>
                  </div>
                </div>

                {complianceMode && currentPos.compliance.issues.length > 0 && (
                  <div className="compliance-issues">
                    <h4>⚠️ Compliance Issues</h4>
                    {currentPos.compliance.issues.map((issue, index) => (
                      <div key={index} className={`issue ${issue.severity}`}>
                        <span className="issue-type">{issue.type.replace('_', ' ').toUpperCase()}</span>
                        <span className="issue-message">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="card">
            <h2>Voyage Track</h2>
            <div style={{ height: '500px', width: '100%' }}>
              <MapContainer
                center={currentPos ? [currentPos.latitude, currentPos.longitude] : [20, 0]}
                zoom={8}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                />
                {/* Backup OpenStreetMap with English preference */}
                {/* <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  lang="en"
                /> */}
                
                {/* Voyage Path */}
                {voyagePath.length > 1 && (
                  <Polyline
                    positions={voyagePath}
                    pathOptions={{
                      color: '#0066cc',
                      weight: 3,
                      opacity: 0.7
                    }}
                  />
                )}

                {/* Current Position */}
                {currentPos && (
                  <Marker
                    position={[currentPos.latitude, currentPos.longitude]}
                    icon={createVesselIcon(currentPos.course, isPlaying)}
                  >
                    <Popup>
                      <div>
                        <h4>{selectedVessel.name}</h4>
                        <p><strong>Time:</strong> {new Date(currentPos.timestamp).toLocaleString()}</p>
                        <p><strong>Speed:</strong> {currentPos.speed?.toFixed(1)} knots</p>
                        <p><strong>Course:</strong> {currentPos.course?.toFixed(0)}°</p>
                        <p><strong>Compliance:</strong> 
                          <span className={`compliance-badge ${currentPos.compliance.status}`}>
                            {currentPos.compliance.status}
                          </span>
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Compliance Markers */}
                {complianceMode && voyageData.map((pos, index) => {
                  if (pos.compliance.issues.length === 0 || index > currentPosition) return null;
                  
                  return (
                    <Marker
                      key={`compliance-${index}`}
                      position={[pos.latitude, pos.longitude]}
                      icon={L.divIcon({
                        html: `<div class="compliance-marker ${pos.compliance.status}">⚠️</div>`,
                        className: 'compliance-marker-icon',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8],
                      })}
                    >
                      <Popup>
                        <div>
                          <h4>Compliance Issue</h4>
                          <p><strong>Time:</strong> {new Date(pos.timestamp).toLocaleString()}</p>
                          {pos.compliance.issues.map((issue, i) => (
                            <p key={i}><strong>{issue.type}:</strong> {issue.message}</p>
                          ))}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          </div>

          {/* Compliance Summary */}
          {complianceMode && (
            <div className="card">
              <div className="compliance-summary">
                <h2>📋 Compliance Analysis</h2>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-value">{voyageData.filter(p => p.compliance.status === 'violation').length}</span>
                    <span className="stat-label">Violations</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{voyageData.filter(p => p.compliance.status === 'warning').length}</span>
                    <span className="stat-label">Warnings</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-value">{(voyageData.reduce((sum, p) => sum + p.compliance.score, 0) / voyageData.length).toFixed(0)}</span>
                    <span className="stat-label">Avg Score</span>
                  </div>
                </div>

                <div className="compliance-actions">
                  <button className="btn btn-outline" onClick={() => jumpToCompliance('speed_violation')}>
                    Jump to Speed Violations
                  </button>
                  <button className="btn btn-outline" onClick={() => jumpToCompliance('course_deviation')}>
                    Jump to Course Deviations
                  </button>
                  <button className="btn btn-outline" onClick={() => jumpToCompliance('ais_gap')}>
                    Jump to AIS Gaps
                  </button>
                  <button className="btn btn-success" onClick={exportComplianceReport}>
                    📄 Export Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VoyageReplay;