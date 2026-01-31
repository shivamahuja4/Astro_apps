const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const fetchCurrentPositions = async (options = {}) => {
    const { datetime, lat, lon, timezone } = options;
    const params = new URLSearchParams();

    if (datetime) params.append('dt', datetime);
    if (lat !== null && lat !== undefined) params.append('lat', lat);
    if (lon !== null && lon !== undefined) params.append('lon', lon);
    if (timezone) params.append('timezone', timezone);

    const queryString = params.toString();
    const url = queryString
        ? `${API_BASE_URL}/current?${queryString}`
        : `${API_BASE_URL}/current`;

    const response = await fetch(url);
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

export const fetchBirthChart = async (datetime, lat, lon, timezone) => {
    const params = new URLSearchParams();
    params.append('dt', datetime);
    params.append('lat', lat);
    params.append('lon', lon);
    params.append('timezone', timezone);

    const response = await fetch(`${API_BASE_URL}/birthchart?${params}`);
    return response.json();
};
