import { useEffect, useState } from 'react';
import { fetchCalendar } from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Calendar() {
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await fetchCalendar(year, month);
            setData(res.events);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [year, month]);

    const changeMonth = (delta) => {
        setDate(d => {
            const newDate = new Date(d);
            newDate.setMonth(d.getMonth() + delta);
            return newDate;
        });
    };

    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-white tracking-tight">Calendar</h1>

                {/* Month selector */}
                <div className="flex items-center gap-1 bg-white/[0.04] rounded-lg p-1 border border-white/[0.06]">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-white/[0.06] rounded-md text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm w-36 text-center text-white/80">{monthName}</span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-white/[0.06] rounded-md text-white/50 hover:text-white transition-colors"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                </div>
            ) : data.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                    No events found for this month.
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-white/[0.02] border-b border-white/[0.04]">
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Event</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider hidden sm:table-cell">Type</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider hidden md:table-cell">Position</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {data.map((event, idx) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <p className="text-sm text-white/80">{event.display_date}</p>
                                        <p className="text-xs text-white/30">{event.time} IST</p>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-white/90">{event.event_name}</p>
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap hidden sm:table-cell">
                                        <EventBadge type={event.type} />
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap hidden md:table-cell">
                                        <p className="text-sm font-mono text-white/50">{event.degree}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function EventBadge({ type }) {
    const getStyle = () => {
        if (type.includes('Conjunction')) return 'bg-amber-500/10 text-amber-400/80 border-amber-500/20';
        if (type.includes('Opposition')) return 'bg-rose-500/10 text-rose-400/80 border-rose-500/20';
        if (type.includes('Trine')) return 'bg-sky-500/10 text-sky-400/80 border-sky-500/20';
        if (type.includes('Retrograde')) return 'bg-violet-500/10 text-violet-400/80 border-violet-500/20';
        if (type.includes('Transit')) return 'bg-teal-500/10 text-teal-400/80 border-teal-500/20';
        return 'bg-white/[0.06] text-white/50 border-white/10';
    };

    const getLabel = () => {
        if (type.includes('Conjunction')) return 'Conjunction';
        if (type.includes('Opposition')) return 'Opposition';
        if (type.includes('Trine')) return 'Trine';
        if (type.includes('Retrograde')) return 'Retrograde';
        if (type.includes('Transit')) return 'Transit';
        return type;
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}>
            {getLabel()}
        </span>
    );
}
