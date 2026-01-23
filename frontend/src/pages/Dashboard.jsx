import { useEffect, useState } from 'react';
import { fetchCurrentPositions } from '../services/api';
import { RefreshCw } from 'lucide-react';
import ZodiacChart from '../components/ZodiacChart';

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
        return (
            <div className="flex h-80 items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-white tracking-tight">Planetary Positions</h1>
                    <p className="text-sm text-white/40 mt-1">
                        {new Date(data?.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                        })} IST
                    </p>
                </div>
                <button
                    onClick={loadData}
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
