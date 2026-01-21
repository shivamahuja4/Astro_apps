import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
            <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none"></div>
            <div className="fixed inset-0 z-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>

            <nav className="relative z-10 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <Link to="/" className="text-xl font-bold bg-gradient-to-r from-amber-200 to-purple-400 bg-clip-text text-transparent">
                                AstroVeda
                            </Link>
                            <div className="hidden md:flex space-x-4">
                                <NavLink to="/">Dashboard</NavLink>
                                <NavLink to="/transits">Transits</NavLink>
                                <NavLink to="/calendar">Calendar</NavLink>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>
        </div>
    );
}

function NavLink({ to, children }) {
    return (
        <Link
            to={to}
            className="px-3 py-2 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
        >
            {children}
        </Link>
    )
}
