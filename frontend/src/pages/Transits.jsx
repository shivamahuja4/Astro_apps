import { useEffect, useState } from 'react';
import { fetchTransits } from '../services/api';
import { Loader2, ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const PLANETS = ['Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'];

export default function Transits() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedPlanet, setSelectedPlanet] = useState(null); // null means all (General View)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchTransits(year, selectedPlanet || undefined);
            setData(res.transits);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [year, selectedPlanet]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Planetary Transits</h1>

                <div className="flex items-center gap-2 bg-slate-900 rounded-lg p-1 border border-white/10">
                    <button
                        onClick={() => setYear(y => y - 1)}
                        className="p-2 hover:bg-white/5 rounded-md text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-mono text-lg w-16 text-center">{year}</span>
                    <button
                        onClick={() => setYear(y => y + 1)}
                        className="p-2 hover:bg-white/5 rounded-md text-slate-400 hover:text-white"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setSelectedPlanet(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${selectedPlanet === null
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                >
                    Major Transits (No Moon)
                </button>
                <button
                    onClick={() => setSelectedPlanet('Moon')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${selectedPlanet === 'Moon'
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                            : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                        }`}
                >
                    Moon
                </button>
                {PLANETS.map(p => (
                    <button
                        key={p}
                        onClick={() => setSelectedPlanet(p)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${selectedPlanet === p
                                ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                                : 'bg-slate-900 border-white/10 text-slate-400 hover:border-white/20'
                            }`}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : (
                <div className="space-y-2">
                    {data.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No transits found for this period.</div>
                    ) : (
                        data.map((transit, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                <div className="w-32 flex-shrink-0 text-slate-400 text-sm">
                                    {transit.display_time.split(',')[0]}
                                    <div className="text-xs text-slate-500">{transit.display_time.split(',')[1]}</div>
                                </div>
                                <div className="flex-1 flex items-center gap-3">
                                    <span className="font-bold text-amber-100">{transit.planet}</span>
                                    <span className="text-slate-500 text-sm uppercase px-1">Enters</span>
                                    <span className="font-semibold text-purple-300">{transit.to_sign}</span>
                                </div>
                                <div className="hidden sm:block text-slate-600 text-xs">
                                    from {transit.from_sign}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
