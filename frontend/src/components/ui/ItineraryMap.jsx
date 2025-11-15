import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different activity types
const createCustomIcon = (color, type, number = null) => {
  const emoji = getActivityEmoji(type);
  const displayText = number !== null ? number : emoji;
  
  const iconHtml = `
    <div style="
      background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${number !== null ? '14px' : '16px'};
      color: white;
      font-weight: bold;
      position: relative;
      transition: transform 0.2s;
    ">
      ${displayText}
      <div style="
        position: absolute;
        bottom: -8px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 8px solid white;
      "></div>
    </div>
  `;
  
  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker-animated',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(Math.min(((num >> 16) & 0xFF) + amount, 255), 0);
  const g = Math.max(Math.min(((num >> 8) & 0xFF) + amount, 255), 0);
  const b = Math.max(Math.min((num & 0xFF) + amount, 255), 0);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
};

const getActivityEmoji = (type) => {
  const emojiMap = {
    'sightseeing': '🏛️',
    'cultural': '🎭',
    'adventure': '🏔️',
    'food': '🍽️',
    'shopping': '🛍️',
    'entertainment': '🎪',
    'accommodation': '🏨',
    'transport': '🚗',
    'activity': '⭐',
    'restaurant': '🍴',
    'attraction': '📍'
  };
  return emojiMap[type] || '📍';
};

const getActivityColor = (type) => {
  const colorMap = {
    'sightseeing': '#3B82F6',
    'cultural': '#8B5CF6',
    'adventure': '#EF4444',
    'food': '#F59E0B',
    'shopping': '#10B981',
    'entertainment': '#EC4899',
    'accommodation': '#6366F1',
    'transport': '#6B7280',
    'activity': '#F97316',
    'restaurant': '#DC2626',
    'attraction': '#059669'
  };
  return colorMap[type] || '#6B7280';
};

// Component to fit map bounds to markers
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [bounds, map]);
  
  return null;
};

// Function to geocode destination and get approximate coordinates
const getDestinationCoordinates = async (destination) => {
  try {
    // Using OpenStreetMap Nominatim API for geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error('Error geocoding destination:', error);
  }
  
  // Fallback coordinates (center of the world)
  return { lat: 20, lng: 0 };
};

const ItineraryMap = ({ 
  itinerary, 
  dailySchedule = [], 
  recommendations = {},
  className = "w-full h-96 rounded-lg border",
  showRoutes = true // New prop to control route display
}) => {
  const [mapCenter, setMapCenter] = React.useState([20, 0]);
  const [markers, setMarkers] = React.useState([]);
  const [routes, setRoutes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDay, setSelectedDay] = React.useState('all');
  const [hoveredMarker, setHoveredMarker] = React.useState(null);

  useEffect(() => {
    const loadMapData = async () => {
      if (!itinerary?.destination) return;
      
      try {
        setLoading(true);
        
        // Get destination coordinates
        const destCoords = await getDestinationCoordinates(itinerary.destination);
        setMapCenter([destCoords.lat, destCoords.lng]);
        
        // Extract locations from daily schedule
        const scheduleMarkers = [];
        const dayRoutes = [];
        
        dailySchedule.forEach((day, dayIndex) => {
          const dayMarkers = [];
          
          if (day.activities && Array.isArray(day.activities)) {
            day.activities.forEach((activity, activityIndex) => {
              if (activity.location) {
                // Create more realistic coordinates around the destination
                const angle = (activityIndex / day.activities.length) * 2 * Math.PI;
                const radius = 0.02 + (Math.random() * 0.015);
                const lat = destCoords.lat + radius * Math.cos(angle);
                const lng = destCoords.lng + radius * Math.sin(angle);
                
                const markerData = {
                  id: `day-${dayIndex}-activity-${activityIndex}`,
                  position: [lat, lng],
                  title: activity.activity,
                  location: activity.location,
                  description: activity.description,
                  cost: activity.estimated_cost,
                  time: activity.time,
                  type: activity.type || 'activity',
                  day: dayIndex + 1,
                  activityNumber: activityIndex + 1,
                  tips: activity.tips,
                  duration: activity.duration
                };
                
                scheduleMarkers.push(markerData);
                dayMarkers.push(markerData);
              }
            });
            
            // Create route for this day
            if (dayMarkers.length > 1) {
              dayRoutes.push({
                day: dayIndex + 1,
                positions: dayMarkers.map(m => m.position),
                color: getDayColor(dayIndex)
              });
            }
          }
        });
        
        // Extract locations from recommendations - handle both old and new format
        const recMarkers = [];
        Object.entries(recommendations).forEach(([category, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item, index) => {
              // Determine marker type based on category
              let markerType = 'attraction';
              if (category.includes('restaurant') || category.includes('cuisine') || category.includes('food') || category.includes('dining')) {
                markerType = 'food';
              } else if (category.includes('shopping')) {
                markerType = 'shopping';
              } else if (category.includes('cultural')) {
                markerType = 'cultural';
              } else if (category.includes('sightseeing')) {
                markerType = 'sightseeing';
              } else if (category.includes('adventure')) {
                markerType = 'adventure';
              }
              
              // Handle both string and object formats
              if (typeof item === 'object' && item.name) {
                // New detailed format with type
                const angle = (index / items.length) * 2 * Math.PI + Math.PI;
                const radius = 0.025 + (Math.random() * 0.01);
                const lat = destCoords.lat + radius * Math.cos(angle);
                const lng = destCoords.lng + radius * Math.sin(angle);
                
                recMarkers.push({
                  id: `rec-${category}-${index}`,
                  position: [lat, lng],
                  title: item.name,
                  description: item.description || '',
                  area: item.area || null,
                  type: item.type || markerType,
                  category: category,
                  isRecommendation: true,
                  rating: item.rating || null,
                  bestTime: item.bestTime || null
                });
              } else if (typeof item === 'string') {
                // Old string format
                const angle = (index / items.length) * 2 * Math.PI + Math.PI;
                const radius = 0.025 + (Math.random() * 0.01);
                const lat = destCoords.lat + radius * Math.cos(angle);
                const lng = destCoords.lng + radius * Math.sin(angle);
                
                recMarkers.push({
                  id: `rec-${category}-${index}`,
                  position: [lat, lng],
                  title: item.split(':')[0],
                  description: item,
                  type: markerType,
                  category: category,
                  isRecommendation: true
                });
              }
            });
          }
        });
        
        console.log(`📍 Loaded ${recMarkers.length} recommendation markers on map`);
        setMarkers([...scheduleMarkers, ...recMarkers]);
        setRoutes(dayRoutes);
        
      } catch (error) {
        console.error('Error loading map data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMapData();
  }, [itinerary, dailySchedule, recommendations]);

  // Filter markers and routes based on selected day
  const filteredMarkers = selectedDay === 'all' 
    ? markers 
    : markers.filter(m => m.day === parseInt(selectedDay) || m.isRecommendation);
    
  const filteredRoutes = selectedDay === 'all'
    ? routes
    : routes.filter(r => r.day === parseInt(selectedDay));

  const bounds = filteredMarkers.length > 0 ? filteredMarkers.map(marker => marker.position) : null;

  // Get unique days
  const days = [...new Set(markers.filter(m => m.day).map(m => m.day))].sort();

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Day Filter Controls - Only show if showRoutes is true */}
      {showRoutes && days.length > 1 && (
        <div className="mb-3 bg-white rounded-lg shadow-sm p-3 border">
          <div className="text-xs font-semibold text-gray-700 mb-2">Select Day:</div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                selectedDay === 'all'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Days
            </button>
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day.toString())}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  selectedDay === day.toString()
                    ? `text-white shadow-md`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedDay === day.toString() ? getDayColor(day - 1) : undefined
                }}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Map Stats - Only show if there are markers */}
      {filteredMarkers.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 text-xs border">
          {filteredMarkers.filter(m => !m.isRecommendation).length > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-gray-700">📍 Activities:</span>
              <span className="text-blue-600 font-bold">{filteredMarkers.filter(m => !m.isRecommendation).length}</span>
            </div>
          )}
          {filteredMarkers.filter(m => m.isRecommendation).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">⭐ Recommended:</span>
              <span className="text-amber-600 font-bold">{filteredMarkers.filter(m => m.isRecommendation).length}</span>
            </div>
          )}
        </div>
      )}

      <div className={className}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {bounds && <FitBounds bounds={bounds} />}
          
          {/* Travel Routes - Only render if showRoutes is true */}
          {showRoutes && filteredRoutes.map((route, index) => (
            <React.Fragment key={`route-${index}`}>
              <Polyline
                positions={route.positions}
                pathOptions={{
                  color: route.color,
                  weight: 4,
                  opacity: 0.7,
                  dashArray: '10, 10',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-medium">
                    Day {route.day} Route ({route.positions.length} stops)
                  </div>
                </Tooltip>
              </Polyline>
              {/* Add directional arrows */}
              {route.positions.map((pos, idx) => {
                if (idx < route.positions.length - 1) {
                  return (
                    <Circle
                      key={`arrow-${index}-${idx}`}
                      center={pos}
                      radius={15}
                      pathOptions={{
                        color: route.color,
                        fillColor: route.color,
                        fillOpacity: 0.3,
                        weight: 1
                      }}
                    />
                  );
                }
                return null;
              })}
            </React.Fragment>
          ))}
          
          {/* Markers */}
          {filteredMarkers.map((marker) => (
            <Marker
              key={marker.id}
              position={marker.position}
              icon={createCustomIcon(
                getActivityColor(marker.type), 
                marker.type,
                marker.activityNumber
              )}
              eventHandlers={{
                mouseover: () => setHoveredMarker(marker.id),
                mouseout: () => setHoveredMarker(null)
              }}
            >
              <Popup maxWidth={350} className="custom-popup">
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className="text-2xl">{getActivityEmoji(marker.type)}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-gray-900 leading-tight">
                        {marker.title}
                      </h3>
                      {marker.day && marker.activityNumber && (
                        <div className="flex items-center gap-2 mt-1">
                          <span 
                            className="text-xs font-semibold px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: getDayColor(marker.day - 1) }}
                          >
                            Day {marker.day}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-medium">
                            Stop #{marker.activityNumber}
                          </span>
                          {marker.time && (
                            <span className="text-xs text-gray-600">
                              🕐 {marker.time}
                            </span>
                          )}
                        </div>
                      )}
                      {marker.isRecommendation && marker.category && (
                        <div className="mt-1">
                          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                            ⭐ {marker.category.replace(/_/g, ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Location */}
                  {marker.location && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-700 mb-2 bg-gray-50 p-2 rounded">
                      <span className="mt-0.5">📍</span>
                      <span className="flex-1">{marker.location}</span>
                    </div>
                  )}
                  
                  {/* About This Place */}
                  {marker.description && (
                    <div className="mb-3 bg-blue-50 border-l-3 border-blue-400 p-2 rounded">
                      <div className="flex items-start gap-1.5">
                        <span className="text-blue-600">ℹ️</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-blue-800 mb-1">
                            About This Place
                          </div>
                          <div className="text-sm text-gray-700 leading-relaxed">
                            {marker.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Area of Interest */}
                  {(marker.area || marker.district || marker.neighborhood) && (
                    <div className="mb-2 bg-purple-50 border-l-3 border-purple-400 p-2 rounded">
                      <div className="flex items-start gap-1.5">
                        <span className="text-purple-600">📌</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-purple-800 mb-0.5">
                            Area of Interest
                          </div>
                          <div className="text-sm text-purple-900 font-medium">
                            {marker.area || marker.district || marker.neighborhood}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {marker.cost !== undefined && marker.cost !== null && (
                      <div className="bg-green-50 px-2 py-1.5 rounded">
                        <div className="text-xs text-green-700 font-medium">💰 Cost</div>
                        <div className="text-sm font-bold text-green-800">
                          ${marker.cost === 0 ? 'Free' : marker.cost}
                        </div>
                      </div>
                    )}
                    
                    {marker.duration && (
                      <div className="bg-blue-50 px-2 py-1.5 rounded">
                        <div className="text-xs text-blue-700 font-medium">⏱️ Duration</div>
                        <div className="text-sm font-bold text-blue-800">
                          {marker.duration}
                        </div>
                      </div>
                    )}
                    
                    {marker.rating && (
                      <div className="bg-yellow-50 px-2 py-1.5 rounded">
                        <div className="text-xs text-yellow-700 font-medium">⭐ Rating</div>
                        <div className="text-sm font-bold text-yellow-800">
                          {marker.rating} / 5.0
                        </div>
                      </div>
                    )}
                    
                    {marker.bestTime && (
                      <div className="bg-indigo-50 px-2 py-1.5 rounded">
                        <div className="text-xs text-indigo-700 font-medium">🌅 Best Time</div>
                        <div className="text-sm font-bold text-indigo-800">
                          {marker.bestTime}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Tips */}
                  {marker.tips && (
                    <div className="bg-amber-50 border-l-3 border-amber-400 p-2 rounded mb-2">
                      <div className="flex items-start gap-1.5">
                        <span className="text-amber-600">💡</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-amber-800 mb-0.5">
                            Insider Tip
                          </div>
                          <div className="text-xs text-amber-900 leading-relaxed">
                            {marker.tips}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Highlights */}
                  {marker.highlights && Array.isArray(marker.highlights) && marker.highlights.length > 0 && (
                    <div className="mb-2 bg-emerald-50 border-l-3 border-emerald-400 p-2 rounded">
                      <div className="flex items-start gap-1.5">
                        <span className="text-emerald-600">✨</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-emerald-800 mb-1">
                            Highlights
                          </div>
                          <ul className="text-xs text-emerald-900 space-y-0.5">
                            {marker.highlights.map((highlight, idx) => (
                              <li key={idx}>• {highlight}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const query = encodeURIComponent(marker.title + ' ' + (marker.location || itinerary.destination));
                        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <span>🗺️</span>
                      <span>View on Map</span>
                    </button>
                    {marker.isRecommendation && (
                      <button
                        onClick={() => {
                          const query = encodeURIComponent(marker.title + ' ' + itinerary.destination + ' reviews');
                          window.open(`https://www.google.com/search?q=${query}`, '_blank');
                        }}
                        className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <span>⭐</span>
                        <span>Reviews</span>
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
              
              {/* Tooltip on hover */}
              <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                <div className="text-center">
                  <div className="font-semibold text-xs">{marker.title}</div>
                  {marker.day && (
                    <div className="text-xs text-gray-600 mt-0.5">
                      Day {marker.day} - {marker.time}
                    </div>
                  )}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <style jsx>{`
        .custom-marker-animated {
          transition: transform 0.2s;
          cursor: pointer;
        }
        .custom-marker-animated:hover {
          transform: scale(1.2);
          z-index: 1000 !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

// Helper function to get color for each day
const getDayColor = (dayIndex) => {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Green  
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];
  return colors[dayIndex % colors.length];
};

export default ItineraryMap;