import { useEffect, useMemo, useState } from 'react'
import MapView from './components/MapView'
import type { Pin, PinStatus } from './types'
import 'leaflet/dist/leaflet.css'

const STORAGE_KEY = 'wtm_pins_v1'

function loadPins(): Pin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
  } catch {
    return []
  }
}

function savePins(pins: Pin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pins))
}

export default function App() {
  const [pins, setPins] = useState<Pin[]>(() => loadPins())
  const [filter, setFilter] = useState<'all' | PinStatus>('all')

  useEffect(() => {
    savePins(pins)
  }, [pins])

  const filteredPins = useMemo(() => {
    if (filter === 'all') return pins
    return pins.filter(p => p.status === filter)
  }, [pins, filter])

  const visitedCount = useMemo(() => pins.filter(p => p.status === 'visited').length, [pins])
  const wishlistCount = useMemo(() => pins.filter(p => p.status === 'wishlist').length, [pins])

  const onExport = () => {
    const blob = new Blob([JSON.stringify(pins, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wanderlust-pins.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImport = async (file: File | null) => {
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      if (!Array.isArray(data)) throw new Error('Invalid file')
      // basic validation
      const sanitized: Pin[] = data.map((d: any) => ({
        id: String(d.id ?? crypto.randomUUID()),
        name: String(d.name ?? 'Unknown'),
        status: d.status === 'visited' ? 'visited' : 'wishlist',
        lat: Number(d.lat),
        lng: Number(d.lng),
        createdAt: String(d.createdAt ?? new Date().toISOString())
      })).filter(d => Number.isFinite(d.lat) && Number.isFinite(d.lng))
      setPins(sanitized)
    } catch (e) {
      alert('Import failed. Make sure you selected a valid JSON export.')
    }
  }

  const onClear = () => {
    if (confirm('Delete all pins?')) {
      setPins([])
    }
  }

  const onToggleStatus = (id: string) => {
    setPins(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'visited' ? 'wishlist' : 'visited' } : p))
  }

  const onDelete = (id: string) => {
    setPins(prev => prev.filter(p => p.id !== id))
  }

  const onAddPin = (pin: Pin) => {
    setPins(prev => [pin, ...prev])
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">🌍</span>
          <strong>Wanderlust Travel Map</strong>
          <span className="muted">Lite</span>
        </div>

        <div className="controls">
          <label className="filter">
            <span>Filter:</span>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="visited">Visited</option>
              <option value="wishlist">Wishlist</option>
            </select>
          </label>

          <button onClick={onExport}>Export JSON</button>
          <label className="import">
            <input type="file" accept="application/json" onChange={(e) => onImport(e.target.files?.[0] ?? null)} />
            Import
          </label>
          <button className="danger" onClick={onClear}>Clear All</button>
        </div>

        <div className="stats">
          <span>Visited: <b>{visitedCount}</b></span>
          <span>Wishlist: <b>{wishlistCount}</b></span>
          <span>Total: <b>{pins.length}</b></span>
        </div>
      </header>

      <main>
        <MapView
          pins={filteredPins}
          onAddPin={onAddPin}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      </main>

      <footer className="footer">
        <span>Tip: Click anywhere on the map to add a pin. Use the circle button to locate yourself.</span>
      </footer>
    </div>
  )
}
