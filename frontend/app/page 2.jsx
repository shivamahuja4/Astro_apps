import DashboardClient from '../components/DashboardClient';

export const metadata = {
    title: 'Current Planetary Positions | AstroShaswaat',
    description: 'View current planetary positions and zodiac chart in Sidereal Zodiac (Lahiri).',
};

export default function Page() {
    return <DashboardClient />;
}
