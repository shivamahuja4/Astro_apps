import { useEffect, useState } from 'react';
import { fetchCurrentPositions } from '../services/api';
import { Loader2, RefreshCw } from 'lucide-react';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchCurrentPositions();
            setData(res);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading && !data) {
        return <div className="flex h-64 items-center justify-center text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Current Planetary Positions</h1>
                    <p className="text-slate-400 mt-1">
                        Sidereal Zodiac (Lahiri) • {new Date(data?.timestamp).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'medium' })}
                    </p>
                </div>
                <button onClick={loadData} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white">
                    <RefreshCw className="h-5 w-5" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.positions.map((planet) => (
                    <PlanetCard key={planet.name} planet={planet} />
                ))}
            </div>
        </div>
    );
}

function PlanetCard({ planet }) {
    const isRetro = planet.retrograde;

    // Sign Colors (Simple mapping)
    const getSignColor = (sign) => {
        const fire = ['Aries', 'Leo', 'Sagittarius'];
        const earth = ['Taurus', 'Virgo', 'Capricorn'];
        const air = ['Gemini', 'Libra', 'Aquarius'];
        const water = ['Cancer', 'Scorpio', 'Pisces'];
        if (fire.includes(sign)) return 'text-red-400';
        if (earth.includes(sign)) return 'text-emerald-400';
        if (air.includes(sign)) return 'text-sky-400';
        if (water.includes(sign)) return 'text-blue-400';
        return 'text-white';
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all group">
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-slate-200">{planet.name}</h3>
                {isRetro && <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">Retrograde</span>}
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-bold ${getSignColor(planet.sign)}`}>
                    {planet.sign}
                </span>
            </div>
            <div className="text-slate-400 font-mono mt-1 text-sm bg-black/20 inline-block px-2 py-1 rounded">
                {planet.degree_str}
            </div>
        </div>
    );
}
