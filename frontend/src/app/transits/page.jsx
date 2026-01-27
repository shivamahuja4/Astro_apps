'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchTransits } from '../../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PLANETS = ['Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];

export default function Transits() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedPlanet, setSelectedPlanet] = useState(null);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchTransits(year, selectedPlanet || undefined);
            setData(res.transits);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [year, selectedPlanet]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Transits</h1>

                {/* Year selector */}
                <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
                    <button
                        onClick={() => setYear(y => y - 1)}
                        className="p-2 hover:bg-white/[0.06] rounded-md text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-sm w-14 text-center text-white/80">{year}</span>
                    <button
                        onClick={() => setYear(y => y + 1)}
                        className="p-2 hover:bg-white/[0.06] rounded-md text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                <FilterPill
                    active={selectedPlanet === null}
                    onClick={() => setSelectedPlanet(null)}
                >
                    All Planets
                </FilterPill>
                <FilterPill
                    active={selectedPlanet === 'Moon'}
                    onClick={() => setSelectedPlanet('Moon')}
                >
                    Moon
                </FilterPill>
                {PLANETS.map(p => (
                    <FilterPill
                        key={p}
                        active={selectedPlanet === p}
                        onClick={() => setSelectedPlanet(p)}
                    >
                        {p}
                    </FilterPill>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                    No transits found for this period.
                </div>
            ) : (
                <div className="space-y-2">
                    {data.map((transit, idx) => (
                        <TransitRow key={idx} transit={transit} />
                    ))}
                </div>
            )}
        </div>
    );
}

function FilterPill({ active, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${active
                ? 'bg-white/[0.1] text-white border border-white/20'
                : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:text-white/70 hover:border-white/10'
                }`}
        >
            {children}
        </button>
    );
}

function TransitRow({ transit }) {
    const [datePart, timePart] = transit.display_time.split(',');

    return (
        <div className="group flex items-center gap-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-200">
            {/* Date */}
            <div className="w-24 flex-shrink-0">
                <p className="text-sm text-white/70">{datePart}</p>
                <p className="text-xs text-white/30">{timePart} IST</p>
            </div>

            {/* Transit info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-medium text-white/90">{transit.planet}</span>
                <span className="text-white/30">→</span>
                <span className="font-medium text-violet-300">{transit.to_sign}</span>
            </div>

            {/* From sign */}
            <div className="hidden sm:block text-xs text-white/30">
                from {transit.from_sign}
            </div>
        </div>
    );
}
