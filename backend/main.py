from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from typing import Optional
import pytz
from engine import calculate_positions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # NOTE: In production, replace "*" with your frontend domain for better security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Vedic Astrology API is running"}

@app.get("/api/current")
def get_current_positions(
    dt: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    timezone: Optional[str] = None
):
    """
    Get planetary positions in Sidereal Zodiac (Lahiri).
    
    Args:
        dt: ISO format datetime string (defaults to current time)
        lat: Latitude for Ascendant calculation (defaults to New Delhi: 28.6139)
        lon: Longitude for Ascendant calculation (defaults to New Delhi: 77.2090)
        timezone: Timezone string like "Asia/Kolkata" (defaults to IST)
    """
    # Determine timezone
    tz_str = timezone or 'Asia/Kolkata'
    try:
        tz = pytz.timezone(tz_str)
    except pytz.exceptions.UnknownTimeZoneError:
        tz = pytz.timezone('Asia/Kolkata')
        tz_str = 'Asia/Kolkata'
    
    # Determine datetime
    if dt:
        try:
            # Parse ISO format datetime
            calc_dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
            # If naive, localize to specified timezone
            if calc_dt.tzinfo is None:
                calc_dt = tz.localize(calc_dt)
        except ValueError:
            # If parsing fails, use current time
            calc_dt = datetime.now(tz)
    else:
        calc_dt = datetime.now(tz)
    
    # Use defaults if lat/lon not provided
    calc_lat = lat if lat is not None else 28.6139
    calc_lon = lon if lon is not None else 77.2090
    
    positions = calculate_positions(calc_dt, calc_lat, calc_lon)
    
    return {
        "timestamp": calc_dt.isoformat(),
        "timezone": tz_str,
        "location": {"lat": calc_lat, "lon": calc_lon},
        "positions": positions
    }

from engine import calculate_transits

@app.get("/api/transits")
def get_transits(year: int = None, planet: str = None):
    """
    Get transits for a specific year or planet.
    defaults to current year.
    """
    if year is None:
        year = datetime.now().year
        
    transits = calculate_transits(year, planet)
    return {
        "year": year,
        "planet": planet,
        "count": len(transits),
        "transits": transits
    }

from engine import calculate_monthly_events

@app.get("/api/calendar")
def get_calendar(year: int, month: int):
    """
    Get astrological events for a specific month.
    """
    events = calculate_monthly_events(year, month)
    return {
        "year": year,
        "month": month,
        "count": len(events),
        "events": events
    }


from cities import search_cities, get_country_name

@app.get("/api/cities")
def search_cities_endpoint(q: str, limit: int = 10):
    """
    Search cities by name for location selection.
    Uses local Geonames database for fast results.
    
    Args:
        q: Search query (city name)
        limit: Maximum results to return (default 10)
    """
    results = search_cities(q, min(limit, 20))  # Cap at 20 max
    
    # Add full country names
    for city in results:
        city["country_name"] = get_country_name(city["country"])
    
    return {
        "query": q,
        "count": len(results),
        "cities": results
    }


from engine import calculate_birth_chart

@app.get("/api/birthchart")
def get_birth_chart(
    dt: str,
    lat: float,
    lon: float,
    timezone: str = "Asia/Kolkata"
):
    """
    Generate complete birth chart data.
    
    Args:
        dt: ISO format datetime string
        lat: Latitude of birth
        lon: Longitude of birth
        timezone: Timezone of birth location
    """
    # Parse datetime
    try:
        tz = pytz.timezone(timezone)
    except pytz.exceptions.UnknownTimeZoneError:
        tz = pytz.timezone('Asia/Kolkata')
        
    try:
        # Parse ISO datetime
        calc_dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
        if calc_dt.tzinfo is None:
            calc_dt = tz.localize(calc_dt)
    except ValueError:
        # Fallback to now if invalid (shouldn't happen with valid input)
        calc_dt = datetime.now(tz)
        
    chart_data = calculate_birth_chart(calc_dt, lat, lon)
    
    return {
        "timestamp": calc_dt.isoformat(),
        "timezone": timezone,
        "location": {"lat": lat, "lon": lon},
        "chart": chart_data
    }
