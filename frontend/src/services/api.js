const API_BASE_URL = '/api';

export const fetchCurrentPositions = async () => {
    const response = await fetch(`${API_BASE_URL}/current`);
    return response.json();
};

export const fetchTransits = async (year, planet) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (planet) params.append('planet', planet);

    const response = await fetch(`${API_BASE_URL}/transits?${params}`);
    return response.json();
};

export const fetchCalendar = async (year, month) => {
    const response = await fetch(`${API_BASE_URL}/calendar?year=${year}&month=${month}`);
    return response.json();
};
