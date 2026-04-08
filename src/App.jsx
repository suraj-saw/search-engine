import React, { useState, useEffect, useRef, useCallback } from 'react'

// ── helpers ──────────────────────────────────────────────────────────────────
function fmt(t) {
  if (!t || t === '00:00:00') return '—'
  const [h, m] = t.split(':')
  const hh = parseInt(h)
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function highlight(text, query) {
  if (!query) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-300/70 text-stone-900 rounded-sm px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}

// ── TrainCard ─────────────────────────────────────────────────────────────────
function TrainCard({ train, query, onClick }) {
  return (
    <div
      onClick={() => onClick(train)}
      className="group relative bg-stone-900 border border-stone-700 hover:border-amber-500/60 rounded-xl p-5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-amber-900/20 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              #{highlight(train.trainNo, query)}
            </span>
            <h3 className="font-semibold text-stone-100 text-sm truncate tracking-wide uppercase">
              {highlight(train.trainName, query)}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
              <span className="font-mono text-stone-300">{train.sourceCode}</span>
              <span>{highlight(train.source, query)}</span>
            </span>
            <span className="text-stone-600">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block"></span>
              <span className="font-mono text-stone-300">{train.destCode}</span>
              <span>{highlight(train.destination, query)}</span>
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-stone-500">{train.stations.length} stops</p>
          <p className="text-xs text-stone-600 mt-0.5">
            {train.stations[train.stations.length - 1]?.distance || '—'} km
          </p>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/0 to-transparent group-hover:via-amber-500/40 transition-all duration-300 rounded-b-xl" />
    </div>
  )
}

// ── TrainDetail ───────────────────────────────────────────────────────────────
function TrainDetail({ train, onClose }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative bg-stone-950 border border-stone-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-sm bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                  Train #{train.trainNo}
                </span>
              </div>
              <h2 className="text-xl font-bold text-stone-100 uppercase tracking-widest mt-2">
                {train.trainName}
              </h2>
              <p className="text-sm text-stone-400 mt-1">
                <span className="text-green-400 font-mono">{train.sourceCode}</span> {train.source}
                <span className="mx-2 text-stone-600">→</span>
                <span className="text-red-400 font-mono">{train.destCode}</span> {train.destination}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-200 transition-colors p-1.5 hover:bg-stone-800 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-4 mt-4 text-xs">
            <span className="bg-stone-800 px-3 py-1.5 rounded-lg text-stone-300">
              <span className="text-stone-500 mr-1">Stops</span>
              <span className="font-semibold">{train.stations.length}</span>
            </span>
            <span className="bg-stone-800 px-3 py-1.5 rounded-lg text-stone-300">
              <span className="text-stone-500 mr-1">Distance</span>
              <span className="font-semibold">{train.stations[train.stations.length - 1]?.distance || '—'} km</span>
            </span>
          </div>
        </div>

        {/* Station list */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-1">
            {train.stations.map((s, i) => {
              const isFirst = i === 0
              const isLast = i === train.stations.length - 1
              return (
                <div key={i} className="flex items-start gap-3 group">
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center pt-3">
                    <div className={`w-3 h-3 rounded-full border-2 shrink-0 ${
                      isFirst ? 'bg-green-500 border-green-400' :
                      isLast ? 'bg-red-400 border-red-300' :
                      'bg-stone-700 border-stone-500 group-hover:border-amber-500/50'
                    }`} />
                    {!isLast && <div className="w-px flex-1 bg-stone-800 mt-1 min-h-[1.5rem]" />}
                  </div>
                  {/* Station info */}
                  <div className="flex-1 flex items-start justify-between pb-3 border-b border-stone-900">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          {s.code}
                        </span>
                        <span className={`text-sm font-medium ${
                          isFirst ? 'text-green-400' : isLast ? 'text-red-400' : 'text-stone-200'
                        }`}>
                          {s.name}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {s.distance !== '0' ? `${s.distance} km from origin` : 'Origin'}
                      </p>
                    </div>
                    <div className="text-right text-xs shrink-0 ml-4">
                      {isFirst ? (
                        <span className="text-stone-400">Dep: <span className="text-stone-200 font-mono">{fmt(s.departure)}</span></span>
                      ) : isLast ? (
                        <span className="text-stone-400">Arr: <span className="text-stone-200 font-mono">{fmt(s.arrival)}</span></span>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="text-stone-400">Arr: <span className="text-stone-200 font-mono">{fmt(s.arrival)}</span></div>
                          <div className="text-stone-400">Dep: <span className="text-stone-200 font-mono">{fmt(s.departure)}</span></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Suggestions ───────────────────────────────────────────────────────────────
function Suggestions({ items, query, activeIdx, onSelect }) {
  if (!items.length) return null
  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-40 max-h-64 overflow-y-auto">
      {items.map((t, i) => (
        <button
          key={t.trainNo}
          onMouseDown={() => onSelect(t)}
          className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
            i === activeIdx ? 'bg-amber-500/10 border-l-2 border-amber-500' : 'hover:bg-stone-800 border-l-2 border-transparent'
          }`}
        >
          <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded shrink-0">
            {t.trainNo}
          </span>
          <span className="text-sm text-stone-200 truncate">{t.trainName}</span>
          <span className="text-xs text-stone-500 ml-auto shrink-0 hidden sm:block">
            {t.sourceCode} → {t.destCode}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [allTrains, setAllTrains] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [activeIdx, setActiveIdx] = useState(-1)
  const [searched, setSearched] = useState(false)
  const [selectedTrain, setSelectedTrain] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filterType, setFilterType] = useState('all') // 'all' | 'number' | 'name' | 'station'

  const inputRef = useRef(null)

  // Load data
  useEffect(() => {
    fetch('/trains_data.json')
      .then((r) => r.json())
      .then((data) => { setAllTrains(data); setLoading(false) })
      .catch(() => setError('Failed to load train data.'))
  }, [])

  // Compute suggestions live
  useEffect(() => {
    const q = query.trim().toLowerCase()
    if (!q || q.length < 2) { setSuggestions([]); return }
    const top = allTrains.filter((t) => {
      if (filterType === 'number') return t.trainNo.toLowerCase().includes(q)
      if (filterType === 'name') return t.trainName.toLowerCase().includes(q)
      if (filterType === 'station') return (
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.stations.some(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q))
      )
      return (
        t.trainNo.toLowerCase().includes(q) ||
        t.trainName.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
      )
    }).slice(0, 8)
    setSuggestions(top)
    setActiveIdx(-1)
  }, [query, allTrains, filterType])

  const doSearch = useCallback((q = query) => {
    const term = q.trim().toLowerCase()
    if (!term) return
    setShowSuggestions(false)
    setSuggestions([])
    const res = allTrains.filter((t) => {
      if (filterType === 'number') return t.trainNo.toLowerCase().includes(term)
      if (filterType === 'name') return t.trainName.toLowerCase().includes(term)
      if (filterType === 'station') return (
        t.source.toLowerCase().includes(term) ||
        t.destination.toLowerCase().includes(term) ||
        t.stations.some(s => s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term))
      )
      return (
        t.trainNo.toLowerCase().includes(term) ||
        t.trainName.toLowerCase().includes(term) ||
        t.source.toLowerCase().includes(term) ||
        t.destination.toLowerCase().includes(term) ||
        t.stations.some(s => s.name.toLowerCase().includes(term) || s.code.toLowerCase().includes(term))
      )
    })
    setResults(res)
    setSearched(true)
  }, [query, allTrains, filterType])

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { setActiveIdx(i => Math.min(i + 1, suggestions.length - 1)); e.preventDefault() }
    else if (e.key === 'ArrowUp') { setActiveIdx(i => Math.max(i - 1, -1)); e.preventDefault() }
    else if (e.key === 'Enter') {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        setQuery(suggestions[activeIdx].trainName)
        setSelectedTrain(suggestions[activeIdx])
        setShowSuggestions(false)
      } else {
        doSearch()
      }
    }
    else if (e.key === 'Escape') setShowSuggestions(false)
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'number', label: 'Train No.' },
    { key: 'name', label: 'Train Name' },
    { key: 'station', label: 'Station' },
  ]

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100" style={{ fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      {/* Subtle grid bg */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'linear-gradient(stone 1px, transparent 1px), linear-gradient(90deg, stone 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header className="border-b border-stone-800/60 bg-stone-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-500 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-stone-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <span className="font-bold text-stone-100 tracking-widest text-sm uppercase">RailSearch</span>
          </div>
          {!loading && (
            <span className="text-xs text-stone-600 ml-auto">
              {allTrains.length.toLocaleString()} trains indexed
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-stone-100 mb-3">
            Find Your <span className="text-amber-400">Train</span>
          </h1>
          <p className="text-stone-500 text-sm">
            Search across {allTrains.length.toLocaleString()} Indian trains by number, name, or station
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <div className="flex gap-2 bg-stone-900 border border-stone-700 rounded-2xl p-2 focus-within:border-amber-500/50 transition-colors shadow-lg">
            <div className="flex items-center pl-2 shrink-0">
              <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={handleKey}
              placeholder={loading ? 'Loading data...' : 'Search train number, name or station…'}
              disabled={loading}
              className="flex-1 bg-transparent outline-none text-stone-100 placeholder-stone-600 text-sm py-2 px-2"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setSearched(false); inputRef.current?.focus() }}
                className="text-stone-600 hover:text-stone-300 px-2 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <button
              onClick={() => doSearch()}
              disabled={loading || !query.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-900 font-semibold text-sm px-5 py-2 rounded-xl transition-colors shrink-0"
            >
              Search
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && (
            <Suggestions items={suggestions} query={query} activeIdx={activeIdx}
              onSelect={(t) => { setSelectedTrain(t); setQuery(t.trainName); setShowSuggestions(false) }} />
          )}
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                filterType === f.key
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-400'
                  : 'border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-20 text-stone-600">
            <div className="inline-block w-6 h-6 border-2 border-stone-700 border-t-amber-500 rounded-full animate-spin mb-4" />
            <p className="text-sm">Loading train database…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-20 text-red-400 text-sm">{error}</div>
        )}

        {/* Results */}
        {!loading && searched && (
          <div>
            <p className="text-xs text-stone-500 mb-4">
              {results.length === 0
                ? 'No trains found'
                : `${results.length.toLocaleString()} train${results.length !== 1 ? 's' : ''} found for "${query}"`}
            </p>
            <div className="space-y-3">
              {results.slice(0, 100).map((t) => (
                <TrainCard key={t.trainNo} train={t} query={query.trim()} onClick={setSelectedTrain} />
              ))}
              {results.length > 100 && (
                <p className="text-center text-xs text-stone-600 pt-4">
                  Showing top 100 of {results.length} results. Refine your search to see more.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty initial state */}
        {!loading && !searched && !error && (
          <div className="text-center py-16 text-stone-700">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm">Enter a train number, name, or station to search</p>
            <p className="text-xs mt-2 text-stone-800">e.g. "Rajdhani", "12301", "Mumbai", "NDLS"</p>
          </div>
        )}
      </main>

      {/* Train Detail Modal */}
      {selectedTrain && <TrainDetail train={selectedTrain} onClose={() => setSelectedTrain(null)} />}
    </div>
  )
}
