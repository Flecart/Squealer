import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { type MapPosition, type Maps } from '@model/message';
import { useEffect, useMemo } from 'react';

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

export interface MapItemsProps {
    positions: Array<[number, number]>;
}

function MapItems({ positions }: MapItemsProps): JSX.Element {
    // NOTA: per cose di compatibilità di leaflet useMap puoi utilizzarlo
    // solamente per componenti figli di MapContainer (setta il context del map)
    const map: L.Map = useMap();
    useEffect(() => {
        if (map != null && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds);
        }
    }, [map]);

    return (
        <>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Polyline pathOptions={{ color: 'blue' }} positions={positions} />
            <Marker position={positions[positions.length - 1] as [number, number]}></Marker>
        </>
    );
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
                        <MapItems positions={memoPositions} />
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
