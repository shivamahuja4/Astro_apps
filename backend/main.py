from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import pytz
from engine import calculate_positions

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Vedic Astrology API is running"}

@app.get("/api/current")
def get_current_positions():
    """
    Get current planetary positions in Sidereal Zodiac (Lahiri).
    Times are calculated for current IST time.
    """
    ist = pytz.timezone('Asia/Kolkata')
    now_ist = datetime.now(ist)
    
    positions = calculate_positions(now_ist)
    
    return {
        "timestamp": now_ist.isoformat(),
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


