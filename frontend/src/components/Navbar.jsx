'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useCalculationMethod } from '../context/CalculationMethodContext';

export default function Navbar() {
    const { method, updateMethod } = useCalculationMethod();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.04] bg-[#0a0a0f]/80 backdrop-blur-2xl">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="text-lg font-semibold tracking-tight text-white/90 hover:text-white transition-colors">
                            AstroShaswaat
                        </Link>
                        <div className="flex items-center gap-1">
                            <NavLink href="/">Positions</NavLink>
                            <NavLink href="/transits">Transits</NavLink>
                            <NavLink href="/calendar">Calendar</NavLink>
                        </div>
                    </div>

                    <div className="flex items-center bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
                        <button
                            onClick={() => updateMethod('sidereal')}
                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all duration-200 ${method === 'sidereal'
                                ? 'bg-violet-500/20 text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                : 'text-white/30 hover:text-white/50'
                                }`}
                        >
                            Sidereal
                        </button>
                        <button
                            onClick={() => updateMethod('tropical')}
                            className={`px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full transition-all duration-200 ${method === 'tropical'
                                ? 'bg-blue-500/20 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                                : 'text-white/30 hover:text-white/50'
                                }`}
                        >
                            Tropical
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ href, children }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
        >
            {children}
        </Link>
    );
}
