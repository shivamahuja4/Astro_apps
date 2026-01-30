import swisseph as swe
from datetime import datetime
import pytz
from engine import calculate_positions

def verify():
    # Test date: 2024-01-01 12:00 UTC
    dt = datetime(2024, 1, 1, 12, 0, tzinfo=pytz.utc)
    
    print(f"--- Verification for {dt} ---")
    
    # 1. Calculate using Sidereal
    pos_sid = calculate_positions(dt, method="sidereal")
    sun_sid = next(p for p in pos_sid if p['name'] == 'Sun')['full_degree']
    
    # 2. Calculate using Tropical
    pos_trop = calculate_positions(dt, method="tropical")
    sun_trop = next(p for p in pos_trop if p['name'] == 'Sun')['full_degree']
    
    ayanamsa = (sun_trop - sun_sid) % 360
    
    print(f"Sun Sidereal: {sun_sid:.4f}")
    print(f"Sun Tropical: {sun_trop:.4f}")
    print(f"Difference (Ayanamsa): {ayanamsa:.4f}")
    
    if abs(ayanamsa - 24.2) < 0.5:
        print("SUCCESS: Difference is in expected range (approx 24.2 deg for 2024).")
    else:
        print("FAILURE: Difference is unexpected.")

    # Check Ascendant
    asc_sid = next(p for p in pos_sid if p['name'] == 'Ascendant')['full_degree']
    asc_trop = next(p for p in pos_trop if p['name'] == 'Ascendant')['full_degree']
    print(f"Ascendant Sidereal: {asc_sid:.4f}")
    print(f"Ascendant Tropical: {asc_trop:.4f}")
    print(f"Ascendant Diff: {(asc_trop - asc_sid) % 360:.4f}")

if __name__ == "__main__":
    verify()
