import swisseph as swe
from datetime import datetime
import pytz
from engine import calculate_positions

def verify():
    # Test date: 2024-01-01 12:00 UTC
    dt = datetime(2024, 1, 1, 12, 0, tzinfo=pytz.utc)
    jd = swe.julday(2024, 1, 1, 12.0)
    
    print(f"Verification for {dt}")
    
    # 1. Calculate using Tropical (FLG_TROPICAL)
    swe.set_sid_mode(swe.SIDM_FAGAN_BRADLEY, 0, 0) # Reset or set to something else just in case, but flags override usually
    
    res_trop = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_TROPICAL)
    sun_trop = res_trop[0][0]
    
    # 2. Calculate using Sidereal (Lahiri)
    # Our engine should now do this
    positions = calculate_positions(dt)
    sun_sid = next(p for p in positions if p['name'] == 'Sun')['full_degree']
    
    ayanamsa = (sun_trop - sun_sid) % 360
    print(f"Sun Tropical: {sun_trop:.4f}")
    print(f"Sun Sidereal: {sun_sid:.4f}")
    print(f"Calculated Ayanamsa: {ayanamsa:.4f}")
    
    # Lahiri Ayanamsa for 2024-01-01 is approx 24.2 degrees
    if 24.0 < ayanamsa < 25.0:
        print("SUCCESS: Ayanamsa is in expected range for Lahiri.")
    else:
        print("FAILURE: Ayanamsa is incorrect.")

    # Check Ascendant
    asc_sid = next(p for p in positions if p['name'] == 'Ascendant')['full_degree']
    print(f"Ascendant (Sidereal): {asc_sid:.4f}")

if __name__ == "__main__":
    verify()
