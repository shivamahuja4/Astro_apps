'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { fetchCurrentPositions } from '../services/api';
import { RefreshCw, MapPin, X, Search, ChevronDown } from 'lucide-react';
import ZodiacChart from '../components/ZodiacChart';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null); // null = default IST
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const loadData = useCallback(async (loc = location) => {
        setLoading(true);
        try {
            const res = await fetchCurrentPositions({
                datetime: null, // Always live
                lat: loc?.lat || null,
                lon: loc?.lon || null,
                timezone: loc?.timezone || null
            });
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [location]);

    useEffect(() => {
        loadData();
        // Auto-refresh every 60 seconds for live chart
        const interval = setInterval(() => loadData(), 60000);
        return () => clearInterval(interval);
    }, []);

    // Search cities with debounce
    const searchCities = async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const response = await fetch(`${API_BASE_URL}/cities?q=${encodeURIComponent(query)}&limit=8`);
            const data = await response.json();
            if (data.cities) {
                setSearchResults(data.cities.map(city => ({
                    name: city.name,
                    country: city.country_name || city.country,
                    lat: city.lat,
                    lon: city.lon,
                    timezone: city.timezone
                })));
            }
        } catch (error) {
            console.error('City search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        searchTimeoutRef.current = setTimeout(() => {
            searchCities(query);
        }, 150);
    };

    const handleSelectLocation = (loc) => {
        setLocation(loc);
        setShowLocationPicker(false);
        setSearchQuery('');
        setSearchResults([]);
        loadData(loc);
    };

    const handleResetToDefault = () => {
        setLocation(null);
        setShowLocationPicker(false);
        setSearchQuery('');
        setSearchResults([]);
        loadData(null);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowLocationPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (loading && !data) {
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        );
    }

    // Format display timestamp
    const formatTimestamp = () => {
        if (!data?.timestamp) return '';
        const date = new Date(data.timestamp);
        const tz = data.timezone || 'Asia/Kolkata';
        return date.toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: tz
        }) + ` (${tz.split('/')[1] || tz})`;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Planetary Positions</h1>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <p className="text-sm text-white/40">
                            {formatTimestamp()}
                        </p>

                        {/* Timezone Toggle */}
                        <div ref={searchRef} className="relative">
                            <button
                                onClick={() => setShowLocationPicker(!showLocationPicker)}
                                className="flex items-center gap-1 text-xs text-blue-400/80 hover:text-blue-300 transition-colors"
                            >
                                <MapPin className="h-3 w-3" />
                                {location ? `${location.name}` : 'Change timezone'}
                                <ChevronDown className={`h-3 w-3 transition-transform ${showLocationPicker ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Location Picker Dropdown */}
                            {showLocationPicker && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-white/[0.06]">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={handleSearchChange}
                                                placeholder="Search city..."
                                                autoFocus
                                                className="w-full pl-10 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20"
                                            />
                                            {isSearching && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-60 overflow-auto">
                                        {/* Default option */}
                                        <button
                                            onClick={handleResetToDefault}
                                            className={`w-full px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors flex items-center justify-between ${!location ? 'bg-white/[0.04]' : ''}`}
                                        >
                                            <div>
                                                <span className="text-white text-sm">New Delhi, India</span>
                                                <span className="text-white/30 text-xs block">Asia/Kolkata (Default)</span>
                                            </div>
                                            {!location && <span className="text-blue-400 text-xs">✓</span>}
                                        </button>

                                        {/* Search results */}
                                        {searchResults.map((city, idx) => (
                                            <button
                                                key={`${city.name}-${city.lat}-${idx}`}
                                                onClick={() => handleSelectLocation(city)}
                                                className="w-full px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                                            >
                                                <span className="text-white text-sm">{city.name}</span>
                                                <span className="text-white/40 text-sm">, {city.country}</span>
                                                <span className="text-white/30 text-xs block">{city.timezone}</span>
                                            </button>
                                        ))}

                                        {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                                            <div className="px-4 py-3 text-white/40 text-sm text-center">
                                                No cities found
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Clear location button */}
                        {location && (
                            <button
                                onClick={handleResetToDefault}
                                className="p-1 hover:bg-white/10 rounded transition-colors"
                                title="Reset to default"
                            >
                                <X className="h-3 w-3 text-white/40" />
                            </button>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => loadData()}
                    disabled={loading}
                    className="self-start p-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] transition-all duration-200 text-white/60 hover:text-white disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Zodiac Chart */}
            <div className="flex justify-center py-4">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
                    <ZodiacChart positions={data?.positions} />
                </div>
            </div>

            {/* Positions Grid */}
            <div>
                <h2 className="text-lg font-medium text-white/70 mb-4">Detailed Positions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {data?.positions.map((planet) => (
                        <PlanetCard key={planet.name} planet={planet} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function PlanetCard({ planet }) {
    const isRetro = planet.retrograde;

    const getElementColor = (sign) => {
        const fire = ['Aries', 'Leo', 'Sagittarius'];
        const earth = ['Taurus', 'Virgo', 'Capricorn'];
        const air = ['Gemini', 'Libra', 'Aquarius'];
        const water = ['Cancer', 'Scorpio', 'Pisces'];

        if (fire.includes(sign)) return { bg: 'bg-orange-500/8', border: 'border-orange-500/20', text: 'text-orange-300' };
        if (earth.includes(sign)) return { bg: 'bg-emerald-500/8', border: 'border-emerald-500/20', text: 'text-emerald-300' };
        if (air.includes(sign)) return { bg: 'bg-sky-500/8', border: 'border-sky-500/20', text: 'text-sky-300' };
        if (water.includes(sign)) return { bg: 'bg-blue-500/8', border: 'border-blue-500/20', text: 'text-blue-300' };
        return { bg: 'bg-white/[0.04]', border: 'border-white/10', text: 'text-white' };
    };

    const colors = getElementColor(planet.sign);

    return (
        <div className={`group relative p-4 rounded-xl ${colors.bg} border ${colors.border} transition-all duration-300 hover:border-white/20`}>
            {/* Retrograde indicator */}
            {isRetro && (
                <div className="absolute top-3 right-3">
                    <span className="text-[10px] font-medium tracking-wider uppercase text-rose-400/80 bg-rose-500/10 px-1.5 py-0.5 rounded">
                        Rx
                    </span>
                </div>
            )}

            {/* Planet name */}
            <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
                {planet.name}
            </p>

            {/* Sign */}
            <p className={`text-lg font-semibold ${colors.text} mb-1`}>
                {planet.sign}
            </p>

            {/* Degree */}
            <p className="text-sm font-mono text-white/50">
                {planet.degree_str}
            </p>
        </div>
    );
}
