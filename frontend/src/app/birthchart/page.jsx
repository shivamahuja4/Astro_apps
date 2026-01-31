'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchBirthChart } from '../../services/api';
import ZodiacChart from '../../components/ZodiacChart';
import { Calendar, Clock, MapPin, Search, ChevronDown, Check } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export default function BirthChartPage() {
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        location: null
    });
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    // Search cities
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
        setShowDropdown(true);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => searchCities(query), 150);
    };

    const handleSelectLocation = (loc) => {
        setFormData(prev => ({ ...prev, location: loc }));
        setSearchQuery(`${loc.name}, ${loc.country}`);
        setShowDropdown(false);
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date || !formData.time || !formData.location) return;

        setLoading(true);
        try {
            const dt = `${formData.date}T${formData.time}:00`;
            const data = await fetchBirthChart(
                dt,
                formData.location.lat,
                formData.location.lon,
                formData.location.timezone
            );
            setChartData(data);
        } catch (error) {
            console.error("Error generating chart:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-semibold text-white tracking-tight">Birth Chart Calculator</h1>

            {/* Input Form */}
            <div className="bg-[#1a1a1f] border border-white/[0.06] rounded-2xl p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">

                    {/* Date */}
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Date of Birth</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-white/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Time */}
                    <div>
                        <label className="block text-sm text-white/60 mb-2">Time of Birth</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <input
                                type="time"
                                value={formData.time}
                                onChange={e => setFormData({ ...formData, time: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white focus:outline-none focus:border-white/20 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="md:col-span-1" ref={searchRef}>
                        <label className="block text-sm text-white/60 mb-2">Place of Birth</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search city..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 transition-all"
                                required
                            />
                            {formData.location && searchQuery === `${formData.location.name}, ${formData.location.country}` && (
                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-400" />
                            )}

                            {/* Dropdown */}
                            {showDropdown && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1f] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-auto">
                                    {searchResults.map((city, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectLocation(city)}
                                            className="w-full px-4 py-2.5 text-left hover:bg-white/[0.06] transition-colors"
                                        >
                                            <div className="text-white text-sm">{city.name}</div>
                                            <div className="text-white/40 text-xs">{city.country}, {city.timezone}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading || !formData.date || !formData.time || !formData.location}
                            className="w-full h-[42px] bg-white text-black font-medium rounded-xl hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Calculating...' : 'Generate Chart'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {chartData && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Charts & Basic Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        {/* Zodiac Wheel */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 flex justify-center">
                            <ZodiacChart positions={chartData.chart.positions} />
                        </div>

                        {/* Planetary Positions Table */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h3 className="text-lg font-medium text-white">Planetary Positions</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white/40 uppercase bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3">Planet</th>
                                            <th className="px-6 py-3">Sign</th>
                                            <th className="px-6 py-3">Degree</th>
                                            <th className="px-6 py-3">House</th>
                                            <th className="px-6 py-3">Motion</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {chartData.chart.positions.map((planet) => (
                                            <tr key={planet.name} className="hover:bg-white/[0.02]">
                                                <td className="px-6 py-3 font-medium text-white">{planet.name}</td>
                                                <td className="px-6 py-3 text-white/80">{planet.sign}</td>
                                                <td className="px-6 py-3 text-white/60 font-mono text-xs">{planet.degree_str}</td>
                                                <td className="px-6 py-3 text-white/80">{planet.house}</td>
                                                <td className="px-6 py-3">
                                                    {planet.retrograde ? (
                                                        <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">Retrograde</span>
                                                    ) : (
                                                        <span className="text-xs text-white/40">Direct</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Aspects & Houses Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Aspects Table */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h3 className="text-lg font-medium text-white">Planetary Aspects</h3>
                            </div>
                            <div className="overflow-x-auto max-h-96 overflow-y-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white/40 uppercase bg-white/[0.02] sticky top-0 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-3">Planet 1</th>
                                            <th className="px-6 py-3">Aspect</th>
                                            <th className="px-6 py-3">Planet 2</th>
                                            <th className="px-6 py-3">Orb</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {chartData.chart.aspects.map((aspect, idx) => (
                                            <tr key={idx} className="hover:bg-white/[0.02]">
                                                <td className="px-6 py-3 text-white">{aspect.planet1}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium
                                                        ${aspect.aspect === 'Trine' ? 'text-emerald-400 bg-emerald-500/10' :
                                                            aspect.aspect === 'Opposition' ? 'text-rose-400 bg-rose-500/10' :
                                                                aspect.aspect === 'Square' ? 'text-orange-400 bg-orange-500/10' :
                                                                    'text-blue-400 bg-blue-500/10'}`}>
                                                        {aspect.symbol} {aspect.aspect}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-white">{aspect.planet2}</td>
                                                <td className="px-6 py-3 text-white/40 text-xs font-mono">{aspect.orb.toFixed(2)}°</td>
                                            </tr>
                                        ))}
                                        {chartData.chart.aspects.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-white/30">
                                                    No major aspects found within orbs
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* House Cusps Table */}
                        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <h3 className="text-lg font-medium text-white">House Cusps (Whole Sign)</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-white/40 uppercase bg-white/[0.02]">
                                        <tr>
                                            <th className="px-6 py-3">House</th>
                                            <th className="px-6 py-3">Sign</th>
                                            <th className="px-6 py-3">Degree</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {chartData.chart.houses.map((house) => (
                                            <tr key={house.house} className="hover:bg-white/[0.02]">
                                                <td className="px-6 py-3 font-medium text-white">House {house.house}</td>
                                                <td className="px-6 py-3 text-white/80">{house.sign}</td>
                                                <td className="px-6 py-3 text-white/60 font-mono text-xs">{house.cusp_degree_str}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
