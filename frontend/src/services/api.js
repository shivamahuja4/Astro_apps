const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const fetchCurrentPositions = async (method = 'sidereal') => {
    const response = await fetch(`${API_BASE_URL}/current?method=${method}`);
    return response.json();
};

export const fetchTransits = async (year, planet, method = 'sidereal') => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (planet) params.append('planet', planet);
    params.append('method', method);

    const response = await fetch(`${API_BASE_URL}/transits?${params}`);
    return response.json();
};

export const fetchCalendar = async (year, month, method = 'sidereal') => {
    const response = await fetch(`${API_BASE_URL}/calendar?year=${year}&month=${month}&method=${method}`);
    return response.json();
};
