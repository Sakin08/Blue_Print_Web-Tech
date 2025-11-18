import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const createCustomIcon = (color = 'blue') => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, 15);
        }
    }, [center, map]);
    return null;
};

const EventMap = ({ events, onEventClick, selectedEvent }) => {
    const [mapCenter, setMapCenter] = useState([24.9158, 91.8708]); // SUST coordinates
    const [userLocation, setUserLocation] = useState(null);

    useEffect(() => {
        // Get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                },
                (error) => {
                    console.log('Location access denied, using default location');
                }
            );
        }
    }, []);

    // Filter events with coordinates
    const eventsWithLocation = events.filter(
        event => event.coordinates?.lat && event.coordinates?.lng
    );

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg">
            <MapContainer
                center={mapCenter}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapUpdater center={selectedEvent?.coordinates ? [selectedEvent.coordinates.lat, selectedEvent.coordinates.lng] : null} />

                {/* User location marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={createCustomIcon('green')}>
                        <Popup>
                            <div className="text-center">
                                <strong>📍 You are here</strong>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Event markers */}
                {eventsWithLocation.map((event) => (
                    <Marker
                        key={event._id}
                        position={[event.coordinates.lat, event.coordinates.lng]}
                        icon={createCustomIcon(selectedEvent?._id === event._id ? 'red' : 'blue')}
                        eventHandlers={{
                            click: () => onEventClick && onEventClick(event),
                        }}
                    >
                        <Popup>
                            <div className="min-w-[200px]">
                                {event.images?.[0] && (
                                    <img
                                        src={event.images[0]}
                                        alt={event.title}
                                        className="w-full h-32 object-cover rounded-lg mb-2"
                                    />
                                )}
                                <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                                <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                                <p className="text-xs text-gray-500 mb-2">
                                    {new Date(event.date).toLocaleDateString()} at{' '}
                                    {new Date(event.date).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </p>
                                <div className="flex items-center gap-2 text-sm">
                                    <span>❤️ {event.interested?.length || 0}</span>
                                    {event.capacity > 0 && (
                                        <span>👥 {event.rsvpCount}/{event.capacity}</span>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                <h4 className="font-semibold text-sm mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Events</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Your Location</span>
                    </div>
                </div>
            </div>

            {/* Event count badge */}
            <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2 z-[1000]">
                <span className="font-semibold text-gray-900">
                    📍 {eventsWithLocation.length} Events on Map
                </span>
            </div>
        </div>
    );
};

export default EventMap;
