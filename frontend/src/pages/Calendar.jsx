import { useEffect, useState } from 'react';
import { fetchCalendar } from '../services/api';
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
    const [date, setDate] = useState(new Date()); // Use date to track year/month
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS months are 0-11

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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <CalendarIcon className="h-8 w-8 text-purple-400" />
                    Astrological Calendar
                </h1>

                <div className="flex items-center gap-4 bg-slate-900 rounded-lg p-1 px-2 border border-white/10">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-white/5 rounded-md text-slate-400 hover:text-white"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="font-medium text-lg w-40 text-center">
                        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-white/5 rounded-md text-slate-400 hover:text-white"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex h-64 items-center justify-center text-slate-400"><Loader2 className="animate-spin h-8 w-8" /></div>
            ) : (
                <div className="overflow-hidden bg-slate-900/30 border border-white/5 rounded-xl">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date & Time (IST)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Event</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Position/Degree</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">No major events found for this month.</td>
                                </tr>
                            ) : (
                                data.map((event, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                            <div className="font-medium text-white">{event.display_date}</div>
                                            <div className="text-slate-500 text-xs">{event.time}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-50">
                                            {event.event_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <Badge type={event.type} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-400 tracking-tight">
                                            {event.degree}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function Badge({ type }) {
    if (type.includes('Conjunction')) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400">Conjunction</span>;
    if (type.includes('Opposition')) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">Opposition</span>;
    if (type.includes('Trine')) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">Trine</span>;
    if (type.includes('Retrograde')) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400">Retrograde</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400">{type}</span>;
}
