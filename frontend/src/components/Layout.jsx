import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-['Inter',sans-serif] selection:bg-violet-500/30">
            {/* Subtle gradient background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f] pointer-events-none" />
            <div className="fixed inset-0 z-0 opacity-30 pointer-events-none" style={{
                backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(120, 80, 200, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(80, 120, 200, 0.06) 0%, transparent 40%)'
            }} />

            <nav className="relative z-10 border-b border-white/[0.04] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <Link to="/" className="text-lg font-semibold tracking-tight text-white/90 hover:text-white transition-colors">
                            AstroShaswaat
                        </Link>
                        <div className="flex items-center gap-1">
                            <NavLink to="/">Positions</NavLink>
                            <NavLink to="/transits">Transits</NavLink>
                            <NavLink to="/calendar">Calendar</NavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-10">
                <Outlet />
            </main>

            <footer className="relative z-10 border-t border-white/[0.04] py-6 mt-16">
                <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <p className="text-center text-xs text-white/30">AstroShaswaat • Sidereal Calculations (Lahiri Ayanamsa)</p>
                </div>
            </footer>
        </div>
    );
}

function NavLink({ to, children }) {
    const location = useLocation();
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-white/[0.08] text-white'
                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04]'
                }`}
        >
            {children}
        </Link>
    )
}
