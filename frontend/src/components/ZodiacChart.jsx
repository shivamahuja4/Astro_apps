'use client';

import React from 'react';

// Abbreviation mappings
const PLANET_ABBR = {
    'Sun': 'Su', 'Moon': 'Mo', 'Mars': 'Ma', 'Mercury': 'Me',
    'Jupiter': 'Ju', 'Venus': 'Ve', 'Saturn': 'Sa',
    'Rahu': 'Ra', 'Ketu': 'Ke',
    'Uranus': 'Ur', 'Neptune': 'Ne', 'Pluto': 'Pl',
    'Ascendant': 'Asc'
};

const SIGN_ABBR = {
    'Aries': 'Ar', 'Taurus': 'Ta', 'Gemini': 'Ge', 'Cancer': 'Ca',
    'Leo': 'Le', 'Virgo': 'Vi', 'Libra': 'Li', 'Scorpio': 'Sc',
    'Sagittarius': 'Sg', 'Capricorn': 'Cp', 'Aquarius': 'Aq', 'Pisces': 'Pi'
};

const SIGN_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Planet colors
const PLANET_COLORS = {
    'Sun': '#FFD700', 'Moon': '#C0C0C0', 'Mars': '#FF6B6B',
    'Mercury': '#90EE90', 'Jupiter': '#FFA07A', 'Venus': '#FFB6C1',
    'Saturn': '#87CEEB', 'Rahu': '#9370DB', 'Ketu': '#20B2AA',
    'Uranus': '#00CED1', 'Neptune': '#4169E1', 'Pluto': '#8B4513',
    'Ascendant': '#FFFFFF'
};

export default function ZodiacChart({ positions }) {
    const size = 420; // Increased size slightly
    const center = size / 2;
    // Reduced radii to fit planets inside chart
    const outerRadius = 150;
    const innerRadius = 80;
    const middleRadius = 115;

    // Find Ascendant sign index
    // Default to 0 if not found (should be found if backend works)
    const ascendant = positions?.find(p => p.name === 'Ascendant');
    const ascIndex = ascendant ? SIGN_ORDER.indexOf(ascendant.sign) : 0;

    // Group planets by sign
    const planetsBySign = {};
    SIGN_ORDER.forEach(sign => planetsBySign[sign] = []);

    positions?.forEach(planet => {
        // We can include Ascendant in the chart as a point if desired, 
        // or just use it for rotation. Usually Asc is marked.
        // Let's include it so it shows "Asc" in the sign.
        if (planetsBySign[planet.sign]) {
            planetsBySign[planet.sign].push(planet);
        }
    });

    // Calculate segment angles (starting from top, going clockwise)
    // Rotate so Ascendant sign is at top (Position 1, -90 degrees)
    const getSegmentAngles = (signIndex) => {
        const segmentAngle = 30; // 360 / 12
        // Calculate offset based on Ascendant index.
        // We want the Ascendant sign (ascIndex) to be at -90 degrees.
        // So when signIndex == ascIndex, angle should be -90.
        // Formula: -90 + (signIndex - ascIndex) * 30
        const startAngle = -90 + ((signIndex - ascIndex) * segmentAngle);
        return {
            start: startAngle,
            mid: startAngle + segmentAngle / 2,
            end: startAngle + segmentAngle
        };
    };

    // Convert polar to cartesian
    const polarToCartesian = (angle, radius) => {
        const radian = (angle * Math.PI) / 180;
        return {
            x: center + radius * Math.cos(radian),
            y: center + radius * Math.sin(radian)
        };
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="max-w-full">
                {/* Background circles */}
                <circle cx={center} cy={center} r={outerRadius} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx={center} cy={center} r={innerRadius} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx={center} cy={center} r={middleRadius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Center dot */}
                <circle cx={center} cy={center} r="8" fill="rgba(147, 197, 253, 0.5)" />

                {/* Nakshatras (27 divisions) */}
                {[...Array(27)].map((_, i) => {
                    const nakAngle = (360 / 27);
                    const startAngle = -90 - (ascIndex * 30) + (i * nakAngle);
                    const midAngle = startAngle + nakAngle / 2;

                    const innerP = polarToCartesian(startAngle, middleRadius - 8);
                    const outerP = polarToCartesian(startAngle, middleRadius + 5);
                    const labelP = polarToCartesian(midAngle, middleRadius - 4);

                    return (
                        <g key={i}>
                            <line
                                x1={innerP.x} y1={innerP.y}
                                x2={outerP.x} y2={outerP.y}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="0.5"
                            />
                            <text
                                x={labelP.x} y={labelP.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white/40 text-[7px] font-light"
                                transform={`rotate(${midAngle + 90}, ${labelP.x}, ${labelP.y})`}
                            >
                                {i + 1}
                            </text>
                        </g>
                    );
                })}

                {/* Sign segments */}
                {SIGN_ORDER.map((sign, idx) => {
                    const angles = getSegmentAngles(idx);
                    const midPoint = polarToCartesian(angles.mid, (outerRadius + middleRadius) / 2);
                    const houseNumPoint = polarToCartesian(angles.mid, (middleRadius + innerRadius) / 2);
                    const degreePoint = polarToCartesian(angles.mid, innerRadius - 15);

                    // Draw segment lines
                    const innerPoint = polarToCartesian(angles.start, innerRadius);
                    const outerPoint = polarToCartesian(angles.start, outerRadius);

                    // Get planets in this sign
                    const planetsInSign = planetsBySign[sign] || [];

                    // Calculate average degree for display (excluding Ascendant deg usually? or include? include matches visual)
                    const planetsForDeg = planetsInSign.filter(p => p.name !== 'Ascendant');
                    const avgDegree = planetsForDeg.length > 0
                        ? Math.round(planetsForDeg.reduce((sum, p) => sum + (p.full_degree % 30), 0) / planetsForDeg.length)
                        : null;

                    // Determine House Number relative to Ascendant
                    // 1st House = Ascendant Sign
                    // House = (Sign Index - Asc Index + 12) % 12 + 1
                    const houseNum = (idx - ascIndex + 12) % 12 + 1;

                    return (
                        <g key={sign}>
                            {/* Segment divider line */}
                            <line
                                x1={innerPoint.x} y1={innerPoint.y}
                                x2={outerPoint.x} y2={outerPoint.y}
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="1"
                            />

                            {/* Sign abbreviation */}
                            <text
                                x={midPoint.x} y={midPoint.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white/60 text-xs font-medium"
                            >
                                {SIGN_ABBR[sign]}
                            </text>

                            {/* House number */}
                            <text
                                x={houseNumPoint.x} y={houseNumPoint.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white/30 text-[10px]"
                            >
                                {houseNum}
                            </text>

                            {/* Planets in this sign */}
                            {planetsInSign.map((planet, pIdx) => {
                                // Position planets around the outer edge of the sign segment
                                // Add spacing between planets
                                const planetAngle = angles.start + 6 + (pIdx * 9);
                                const planetPoint = polarToCartesian(planetAngle, outerRadius + 24);
                                const color = PLANET_COLORS[planet.name] || '#ffffff';

                                return (
                                    <g key={planet.name}>
                                        {/* Planet circle */}
                                        <circle
                                            cx={planetPoint.x}
                                            cy={planetPoint.y}
                                            r="13"
                                            fill={`${color}20`}
                                            stroke={`${color}60`}
                                            strokeWidth="1"
                                        />

                                        {/* Planet abbreviation */}
                                        <text
                                            x={planetPoint.x}
                                            y={planetPoint.y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            fill={color}
                                            className="text-[10px] font-semibold"
                                        >
                                            {PLANET_ABBR[planet.name]}
                                        </text>

                                        {/* Retrograde indicator */}
                                        {planet.retrograde && (
                                            <text
                                                x={planetPoint.x + 10}
                                                y={planetPoint.y - 9}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                                className="text-[8px] font-bold fill-rose-400"
                                            >
                                                R
                                            </text>
                                        )}
                                    </g>
                                );
                            })}
                        </g>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
                {positions?.map(planet => (
                    <div key={planet.name} className="flex items-center gap-1.5">
                        <span
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                            style={{
                                backgroundColor: `${PLANET_COLORS[planet.name]}20`,
                                color: PLANET_COLORS[planet.name],
                                border: `1px solid ${PLANET_COLORS[planet.name]}50`
                            }}
                        >
                            {PLANET_ABBR[planet.name]}
                        </span>
                        <span className="text-white/50 text-xs">{planet.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
