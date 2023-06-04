import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { type MapPosition, type Maps } from '@model/message';
import { useMemo } from 'react';

// fixes: https://stackoverflow.com/questions/49441600/react-leaflet-marker-files-not-found
const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapProps {
    positions: Maps['positions'];
}

function Map({ positions }: MapProps): JSX.Element {
    const memoPositions: Array<[number, number]> = useMemo(() => {
        if (positions === undefined) return [];
        return positions.map((pos: MapPosition) => {
            return [pos.lat, pos.lng];
        });
    }, [positions]);

    return (
        <>
            {
                memoPositions.length > 0 ? (
                    <MapContainer
                        style={{ height: '15rem' }}
                        center={memoPositions[memoPositions.length - 1]}
                        zoom={13}
                        scrollWheelZoom={false}
                        dragging={false} // don't allow dragging will get -> https://github.com/Leaflet/Leaflet/issues/6859
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Polyline pathOptions={{ color: 'blue' }} positions={memoPositions} />
                        <Marker position={memoPositions[memoPositions.length - 1] as [number, number]}>
                            <Popup>angi is here</Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <div>no positions</div>
                )
                // should never happen no positions case, if happens, probably error in the API.
            }
        </>
    );
}

export default Map;
