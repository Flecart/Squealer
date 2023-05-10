import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// fixes: https://stackoverflow.com/questions/49441600/react-leaflet-marker-files-not-found
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapProps {
    lat: number;
    lng: number;
}

function Map({ lat, lng }: MapProps): JSX.Element {
    return (
        <MapContainer
            style={{ height: '15rem' }}
            center={[lat, lng]}
            zoom={13}
            scrollWheelZoom={false}
            dragging={false}
        >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[lat, lng]}>
                <Popup>gio is here</Popup>
            </Marker>
        </MapContainer>
    );
}

export default Map;
