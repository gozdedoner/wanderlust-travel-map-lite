import { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import type { Pin } from '../types'
import L, { LatLngExpression } from 'leaflet'

// Ensure default marker icons load correctly under Vite
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import marker1x from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: marker1x,
  shadowUrl: markerShadow,
})

function ClickToAdd({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onAdd(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function LocateButton() {
  const map = useMapEvents({
    locationfound(e) {
      map.flyTo(e.latlng, 8)
    }
  })

  return (
    <button
      className="locate-btn"
      title="Locate me"
      onClick={() => map.locate({ setView: true, maxZoom: 8 })}
    >
      ⦿
    </button>
  )
}

export default function MapView(props: {
  pins: Pin[]
  onAddPin: (pin: Pin) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}) {
  const { pins, onAddPin, onDelete, onToggleStatus } = props
  const defaultCenter: LatLngExpression = [39.0, 35.0] // Türkiye approx
  const mapRef = useRef<L.Map | null>(null)

  const handleAdd = (lat: number, lng: number) => {
    const name = window.prompt('Place name (e.g., city, spot):')
    if (!name) return
    const raw = window.prompt('Status? Type "visited" or "wishlist"', 'wishlist') || 'wishlist'
    const status = raw.toLowerCase() === 'visited' ? 'visited' : 'wishlist'
    onAddPin({
      id: crypto.randomUUID(),
      name,
      status,
      lat,
      lng,
      createdAt: new Date().toISOString()
    })
  }

  // Keep markers stable to avoid rerenders
  const markers = useMemo(() => pins, [pins])

  return (
    <div className="map-wrap">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        ref={(m) => (mapRef.current = m!)}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickToAdd onAdd={handleAdd} />
        <LocateButton />

        {markers.map((p) => (
          <Marker key={p.id} position={[p.lat, p.lng]}>
            <Popup>
              <div className="popup">
                <div className="popup-title">{p.name}</div>
                <div className={`badge ${p.status}`}>{p.status}</div>
                <div className="popup-actions">
                  <button onClick={() => onToggleStatus(p.id)}>
                    Toggle status
                  </button>
                  <button className="danger" onClick={() => onDelete(p.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
