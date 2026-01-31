'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar, Clock, MapPin, RotateCcw, Search, X } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Debounce hook
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

export default function DateTimeLocationControls({
    onSettingsChange,
    initialSettings = {}
}) {
    // Current time helper
    const getNow = () => {
        const now = new Date();
        return {
            date: now.toISOString().split('T')[0],
            time: now.toTimeString().slice(0, 5)
        };
    };

    const { date: nowDate, time: nowTime } = getNow();

    // State
    const [date, setDate] = useState(initialSettings.date || nowDate);
    const [time, setTime] = useState(initialSettings.time || nowTime);
    const [location, setLocation] = useState(initialSettings.location || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const searchRef = useRef(null);
    const debouncedQuery = useDebounce(searchQuery, 150); // Faster debounce for local search

    // Search cities via local backend API (fast!)
    useEffect(() => {
        const searchCities = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const response = await fetch(
                    `${API_BASE_URL}/cities?q=${encodeURIComponent(debouncedQuery)}&limit=10`
                );
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

        searchCities();
    }, [debouncedQuery]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Notify parent of changes
    const notifyChange = useCallback((newDate, newTime, newLocation) => {
        if (onSettingsChange) {
            onSettingsChange({
                date: newDate,
                time: newTime,
                location: newLocation,
                // Build datetime ISO string
                datetime: `${newDate}T${newTime}:00`,
                lat: newLocation?.lat || null,
                lon: newLocation?.lon || null,
                timezone: newLocation?.timezone || null
            });
        }
    }, [onSettingsChange]);

    // Handle date change
    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDate(newDate);
        notifyChange(newDate, time, location);
    };

    // Handle time change
    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTime(newTime);
        notifyChange(date, newTime, location);
    };

    // Handle Now button
    const handleNow = () => {
        const { date: newDate, time: newTime } = getNow();
        setDate(newDate);
        setTime(newTime);
        notifyChange(newDate, newTime, location);
    };

    // Handle location selection
    const handleSelectLocation = (loc) => {
        setLocation(loc);
        setSearchQuery('');
        setShowDropdown(false);
        setSearchResults([]);
        notifyChange(date, time, loc);
    };

    // Handle location clear
    const handleClearLocation = () => {
        setLocation(null);
        notifyChange(date, time, null);
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">
                    Chart Settings
                </h3>
                <button
                    onClick={handleNow}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-lg transition-all"
                >
                    <RotateCcw className="h-3 w-3" />
                    Now
                </button>
            </div>

            {/* Date & Time Row */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Date Picker */}
                <div className="flex-1">
                    <label className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Date
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={handleDateChange}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>

                {/* Time Picker */}
                <div className="flex-1">
                    <label className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Time
                    </label>
                    <input
                        type="time"
                        value={time}
                        onChange={handleTimeChange}
                        className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm focus:outline-none focus:border-white/20 transition-colors"
                    />
                </div>
            </div>

            {/* Location Search */}
            <div ref={searchRef} className="relative">
                <label className="flex items-center gap-2 text-xs text-white/40 mb-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                </label>

                {location ? (
                    // Selected location display
                    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg">
                        <div>
                            <span className="text-white text-sm">{location.name}</span>
                            <span className="text-white/40 text-sm">, {location.country}</span>
                            <span className="text-white/30 text-xs ml-2">({location.timezone})</span>
                        </div>
                        <button
                            onClick={handleClearLocation}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                            <X className="h-4 w-4 text-white/40" />
                        </button>
                    </div>
                ) : (
                    // Search input
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            placeholder="Search city..."
                            className="w-full pl-10 pr-3 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                        />
                        {isSearching && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                )}

                {/* Search Results Dropdown */}
                {showDropdown && searchResults.length > 0 && !location && (
                    <div className="absolute z-50 w-full mt-1 py-1 bg-[#1a1a1f] border border-white/[0.1] rounded-lg shadow-xl max-h-60 overflow-auto">
                        {searchResults.map((city, idx) => (
                            <button
                                key={`${city.name}-${city.lat}-${idx}`}
                                onClick={() => handleSelectLocation(city)}
                                className="w-full px-3 py-2 text-left hover:bg-white/[0.06] transition-colors"
                            >
                                <span className="text-white text-sm">{city.name}</span>
                                <span className="text-white/40 text-sm">, {city.country}</span>
                                <span className="text-white/30 text-xs block mt-0.5">{city.timezone}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Info text */}
            <p className="text-xs text-white/30">
                {location
                    ? `Showing positions for ${location.name} timezone`
                    : 'Default: New Delhi, India (IST)'
                }
            </p>
        </div>
    );
}
