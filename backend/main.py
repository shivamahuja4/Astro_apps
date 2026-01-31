from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pytz
from engine import calculate_positions, calculate_transits, calculate_monthly_events

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
def get_current_positions(method: str = "sidereal"):
    """
    Get current planetary positions in Sidereal or Tropical Zodiac.
    Times are calculated for current IST time.
    """
    ist = pytz.timezone('Asia/Kolkata')
    now_ist = datetime.now(ist)
    
    positions = calculate_positions(now_ist, method=method)
    
    return {
        "timestamp": now_ist.isoformat(),
        "method": method,
        "positions": positions
    }

@app.get("/api/transits")
def get_transits(year: int = None, planet: str = None, method: str = "sidereal"):
    """
    Get transits for a specific year or planet.
    Defaults to current year and sidereal method.
    """
    if year is None:
        year = datetime.now().year
        
    transits = calculate_transits(year, planet, method=method)
    return {
        "year": year,
        "planet": planet,
        "method": method,
        "count": len(transits),
        "transits": transits
    }

@app.get("/api/calendar")
def get_calendar(year: int, month: int, method: str = "sidereal"):
    """
    Get astrological events for a specific month.
    """
    events = calculate_monthly_events(year, month, method=method)
    return {
        "year": year,
        "month": month,
        "method": method,
        "count": len(events),
        "events": events
    }
