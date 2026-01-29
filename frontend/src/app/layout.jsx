import './globals.css';
import Navbar from '../components/Navbar';

export const metadata = {
    title: 'AstroShaswaat - Vedic Astrology Transits & Calendar',
    description: 'Sidereal Calculations and Astrological Insights',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="antialiased font-['Inter',sans-serif]">
                <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-violet-500/30">
                    {/* Subtle gradient background */}
                    <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0a0a0f] via-[#0d0d15] to-[#0a0a0f] pointer-events-none" />
                    <div className="fixed inset-0 z-0 opacity-30 pointer-events-none" style={{
                        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(120, 80, 200, 0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(80, 120, 200, 0.06) 0%, transparent 40%)'
                    }} />

                    <Navbar />

                    <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-10">
                        {children}
                    </main>

                    <footer className="relative z-10 border-t border-white/[0.04] py-6 mt-16">
                        <div className="max-w-6xl mx-auto px-6 lg:px-8">
                            <p className="text-center text-xs text-white/30">AstroShaswaat • Sidereal Calculations (Lahiri Ayanamsa)</p>
                        </div>
                    </footer>
                </div>
            </body>
        </html>
    );
}
