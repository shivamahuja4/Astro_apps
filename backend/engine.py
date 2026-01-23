import swisseph as swe
from datetime import datetime
import pytz

# Constants
PLANETS = {
    'Sun': swe.SUN,
    'Moon': swe.MOON,
    'Mars': swe.MARS,
    'Mercury': swe.MERCURY,
    'Jupiter': swe.JUPITER,
    'Venus': swe.VENUS,
    'Saturn': swe.SATURN,
    'Rahu': swe.MEAN_NODE, # Using Mean Node for Rahu
    'Ketu': None,          # Ketu is 180 degrees from Rahu
    'Uranus': swe.URANUS,
    'Neptune': swe.NEPTUNE,
    'Pluto': swe.PLUTO
}

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

def format_degree(degree_float):
    """Converts a float degree to Degree, Minute, Second string."""
    d = int(degree_float)
    m = int((degree_float - d) * 60)
    s = int(((degree_float - d) * 60 - m) * 60)
    return f"{d}° {m}' {s}\""

def get_julian_day(dt: datetime):
    """Convert datetime to Julian Day (UT)."""
    # Convert input datetime to UTC if it's aware, else assume UTC if naive (or better, make sure input is UTC)
    if dt.tzinfo:
        dt_utc = dt.astimezone(pytz.utc)
    else:
        # Default to UTC if not specified, though caller should provide aware dt
        dt_utc = pytz.utc.localize(dt)
        
    return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, 
                      dt_utc.hour + dt_utc.minute/60.0 + dt_utc.second/3600.0)

def calculate_positions(dt: datetime):
    """
    Calculate planetary positions for a given datetime.
    Uses Lahiri Ayanamsa (Sidereal).
    """
    jd = get_julian_day(dt)
    
    # Set Sidereal Mode (Lahiri)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    positions = []
    
    for name, planet_id in PLANETS.items():
        if name == 'Ketu':
            # Calculate Rahu first, then Ketu is opposite
            # We already handle Rahu in the loop, so we can check if Rahu data exists or just recalculate
            # Use 'Rahu' (Mean Node) position + 180 degrees
            rahu_res = swe.calc_ut(jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
             # swe.calc_ut returns ( (long, lat, dist, speed_long, ...), rflag )
             # Wait, pyswisseph documentation says:
             # calc_ut(jd, planet, flags) -> ((longitude, latitude, distance, speed_long, speed_lat, speed_dist), rflag)
             # IF result is just one tuple, it might differ based on version.
             # Actually, usually it returns a tuple of various coordinates.
             # Let's inspect the output in dev mode if this fails, but usually index 0 is long.
             # Wait, calc_ut returns a tuple of results if successful?
             # documentation: 
             # Returns: tuple (list of 6 floats (long, lat, dist, speed in long, speed in lat, speed in dist), integer (flags))
             
            rahu_pos = rahu_res[0][0] # Longitude
            ketu_pos = (rahu_pos + 180) % 360
            
            sign_index = int(ketu_pos / 30)
            degree_in_sign = ketu_pos % 30
            
            positions.append({
                "name": "Ketu",
                "full_degree": ketu_pos,
                "sign": ZODIAC_SIGNS[sign_index],
                "degree_str": format_degree(degree_in_sign),
                "retrograde": True # Nodes are always retrograde (Mean nodes)
            })
            continue

        # Calculate position
        # FLG_SWIEPH: use Swiss Ephemeris
        # FLG_SIDEREAL: sidereal zodiac
        # FLG_SPEED: to get speed for retrograde check
        flags = swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED
        res = swe.calc_ut(jd, planet_id, flags)
        
        # res is ((long, lat, dist, speed_long, ...), rflag)
        # So we want res[0][0] for longitude, res[0][3] for speed in longitude
        
        try:
             # Check structure
             props = res[0]
             lon = props[0]
             speed = props[3]
        except (IndexError, TypeError):
             # Fallback or error handling
             # If calc_ut fails it might raise Error
             print(f"Error calculating {name}: {res}")
             continue
        
        sign_index = int(lon / 30)
        degree_in_sign = lon % 30
        is_retrograde = speed < 0
        
        positions.append({
            "name": name,
            "full_degree": lon,
            "sign": ZODIAC_SIGNS[sign_index],
            "degree_str": format_degree(degree_in_sign),
            "retrograde": is_retrograde
        })
        
    return positions


def get_sign_from_longitude(lon):
    return int(lon / 30)

def calculate_transits(year: int, planet_name: str = None):
    """
    Calculate transits (sign changes) for a specific year.
    If planet_name is provided, calculate only for that planet.
    Otherwise calculate for all planets (excluding Moon if year view).
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    start_date = datetime(year, 1, 1, tzinfo=pytz.utc)
    end_date = datetime(year + 1, 1, 1, tzinfo=pytz.utc)
    
    start_jd = get_julian_day(start_date)
    end_jd = get_julian_day(end_date)
    
    transits = []
    
    # Filter planets
    targets = PLANETS.items()
    if planet_name:
        if planet_name not in PLANETS:
            return []
        targets = [(planet_name, PLANETS[planet_name])]
    else:
        # Exclude Moon for yearly overview as requested
        targets = [(n, p) for n, p in targets if n != 'Moon']
        
    for name, planet_id in targets:
        if name == 'Ketu': 
            # Ketu is implicitly handled by Rahu logic usually, but here we need to track it explicitly
            # For simplicity, we can calculate Rahu transits and invert?
            # Or just step through.
            # Let's step through for all planets for robustness, although usually we use root finding.
            # Given the timescale (1 year), stepping by day is okayish, but maybe slow for details.
            # OPTIMIZATION: Check start and end positions. If same sign, check for retrograde loops?
            # Actually, simply checking every day is safe enough for 1 year script for ~10 planets.
            pass

        # We will iterate day by day to find sign changes. 
        # For a more robust production app, we would use swisseph's transit search (swe.nd), but it might be complex to set up for sign ingress in sidereal.
        # Simple approach: Step by 1 day. If sign changes, refine.
        
        current_jd = start_jd
        
        # Get initial position
        if name == 'Ketu':
             rahu_pos = swe.calc_ut(current_jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
             curr_pos = (rahu_pos + 180) % 360
        else:
             curr_pos = swe.calc_ut(current_jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
             
        curr_sign = get_sign_from_longitude(curr_pos)
        
        # Step value: 1 day is usually fine, but Moon needs finer.
        # Since we exclude Moon for general view, 1 day is fine.
        # If planet_name == Moon, we might need smaller steps? 
        # Moon moves ~13 deg/day. 1 day step is fine to detect change, but we might miss a quick entry/exit?
        # Actually Moon stays in a sign for ~2.25 days. 6 hours step is safer for Moon.
        step = 1.0 if name != 'Moon' else 0.25
        
        while current_jd < end_jd:
            next_jd = current_jd + step
            
            if name == 'Ketu':
                 rahu_pos = swe.calc_ut(next_jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                 next_pos = (rahu_pos + 180) % 360
            else:
                 next_pos = swe.calc_ut(next_jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
            
            next_sign = get_sign_from_longitude(next_pos)
            
            if curr_sign != next_sign:
                # Sign change detected!
                # Refine time? For now, we take the day/time of detection.
                # To be precise, we could binary search between current_jd and next_jd.
                
                # Binary search for ingress
                left, right = current_jd, next_jd
                ingress_jd = right
                target_sign = next_sign
                
                for _ in range(10): # 10 iterations is usually enough precision
                    mid = (left + right) / 2
                    if name == 'Ketu':
                        r_p = swe.calc_ut(mid, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                        mid_pos = (r_p + 180) % 360
                    else:
                        mid_pos = swe.calc_ut(mid, planet_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                    
                    mid_sign = get_sign_from_longitude(mid_pos)
                    
                    if mid_sign == target_sign:
                        right = mid
                        ingress_jd = mid
                    else:
                        left = mid
                
                # Convert ingress_jd back to date
                dt_ingress = swe.revjul(ingress_jd) # returns (y, m, d, h)
                # Convert to python datetime
                # swe.revjul returns fractional hour.
                year_i, month_i, day_i, hour_float = dt_ingress[0], dt_ingress[1], dt_ingress[2], dt_ingress[3]
                
                # Extract time
                h = int(hour_float)
                m = int((hour_float - h) * 60)
                s = int(((hour_float - h) * 60 - m) * 60)
                
                ingress_dt_utc = datetime(year_i, month_i, day_i, h, m, s, tzinfo=pytz.utc)
                ingress_dt_ist = ingress_dt_utc.astimezone(pytz.timezone('Asia/Kolkata'))
                
                transits.append({
                    "planet": name,
                    "from_sign": ZODIAC_SIGNS[curr_sign],
                    "to_sign": ZODIAC_SIGNS[next_sign],
                    "iso_time": ingress_dt_ist.isoformat(),
                    "display_time": ingress_dt_ist.strftime("%d %b %Y, %I:%M %p")
                })
                
                curr_sign = next_sign
                
            current_jd = next_jd
            curr_pos = next_pos # Optimization
            
    # Sort by time
    transits.sort(key=lambda x: x['iso_time'])
    
    return transits


def get_planet_position_speed(jd, planet_name, planet_id):
    """Helper to get pos/speed for specific planet/node"""
    if planet_name == 'Ketu':
        rahu_res = swe.calc_ut(jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED)
        rahu_pos = rahu_res[0][0]
        rahu_speed = rahu_res[0][3]
        return (rahu_pos + 180) % 360, rahu_speed # Ketu speed same as Rahu (mean node)
    else:
        res = swe.calc_ut(jd, planet_id, swe.FLG_SWIEPH | swe.FLG_SIDEREAL | swe.FLG_SPEED)
        return res[0][0], res[0][3]

def calculate_monthly_events(year: int, month: int):
    """
    Calculate astrological events for a specific month.
    Includes:
    - Aspects (Conjunction 0, Trine 120, Opposition 180)
    - Retrograde movements (Start/End)
    """
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    
    # Range: from 1st of month to 1st of next month
    start_date = datetime(year, month, 1, tzinfo=pytz.utc)
    if month == 12:
        end_date = datetime(year + 1, 1, 1, tzinfo=pytz.utc)
    else:
        end_date = datetime(year, month + 1, 1, tzinfo=pytz.utc)
        
    start_jd = get_julian_day(start_date)
    end_jd = get_julian_day(end_date)
    
    events = []
    
    # 1. RETROGRADE MOVEMENTS
    # Check speed sign change
    # We step by small increments to find station points.
    # Optimization: Check daily. If speed sign differs, refine.
    
    planet_list = [(n, p) for n, p in PLANETS.items()] # All planets
    
    for name, pid in planet_list:
        if name in ['Sun', 'Moon', 'Rahu', 'Ketu']: continue # These don't have standard retro cycles (Sun/Moon never, Nodes always retro/weird)
        
        current_jd = start_jd
        _, prev_speed = get_planet_position_speed(current_jd, name, pid)
        
        step = 1.0 # 1 day
        while current_jd < end_jd:
            next_jd = current_jd + step
            _, next_speed = get_planet_position_speed(next_jd, name, pid)
            
            if (prev_speed > 0 and next_speed < 0) or (prev_speed < 0 and next_speed > 0):
                # Speed changed sign!
                # Refine time of station (speed = 0)
                # Binary search
                l, r = current_jd, next_jd
                station_jd = r
                for _ in range(10):
                    mid = (l + r) / 2
                    _, mid_speed = get_planet_position_speed(mid, name, pid)
                    # We want speed 0, usually transition point is between + and -
                    if (prev_speed > 0 and mid_speed > 0) or (prev_speed < 0 and mid_speed < 0):
                         l = mid
                    else:
                         r = mid
                         station_jd = mid
                
                # Event Type
                etype = "Retrograde Start" if prev_speed > 0 else "Retrograde End"
                
                dt_event = swe.revjul(station_jd)
                e_date = datetime(dt_event[0], dt_event[1], dt_event[2], int(dt_event[3]), int((dt_event[3]%1)*60), tzinfo=pytz.utc)
                ist_date = e_date.astimezone(pytz.timezone('Asia/Kolkata'))
                
                 # Get position at station
                pos_station, _ = get_planet_position_speed(station_jd, name, pid)
                deg_str = format_degree(pos_station % 30)
                sign_str = ZODIAC_SIGNS[int(pos_station / 30)]
                
                events.append({
                    "date": ist_date.isoformat(),
                    "display_date": ist_date.strftime("%d %b %Y"),
                    "time": ist_date.strftime("%I:%M %p"),
                    "type": "Retrograde",
                    "event_name": f"{name} {etype}",
                    "degree": f"{sign_str} {deg_str}"
                })
                
                prev_speed = next_speed # Update for next check logic
            
            prev_speed = next_speed
            current_jd = next_jd

    # 2. ASPECTS (0, 120, 180)
    # We compare every pair of planets. 
    # Pairs: (P1, P2) where P1 index < P2 index to avoid duplicates.
    # Aspects to check: 0 (Conj), 120 (Trine), 180 (Opp)
    # Note: 120 means separation is 120 OR 240 (which is 120 relative).
    
    aspects = [0, 120, 180]
    
    # We step through the month. 
    # For every step, calculate all planet positions.
    # Check if any pair crosses an aspect angle.
    # Step size: 6 hours = 0.25 day (to catch fast moon aspects accurately-ish)
    
    step = 0.25 
    current_jd = start_jd
    
    # Pre-calculate positions for start
    # Store as {name: pos}
    prev_positions = {}
    for name, pid in planet_list:
        p, _ = get_planet_position_speed(current_jd, name, pid)
        prev_positions[name] = p
        
    while current_jd < end_jd:
        next_jd = current_jd + step
        next_positions = {}
        for name, pid in planet_list:
            p, _ = get_planet_position_speed(next_jd, name, pid)
            next_positions[name] = p
            
        # Check pairs (exclude Moon to reduce noise in calendar)
        names = [n for n in PLANETS.keys() if n != 'Moon']
        for i in range(len(names)):
            for j in range(i + 1, len(names)):
                p1 = names[i]
                p2 = names[j]
                
                # Check aspect crossing
                pos1_prev = prev_positions[p1]
                pos2_prev = prev_positions[p2]
                diff_prev = (pos1_prev - pos2_prev) % 360
                
                pos1_next = next_positions[p1]
                pos2_next = next_positions[p2]
                diff_next = (pos1_next - pos2_next) % 360
                
                # Check for crossing of 0, 120, 180, 240 (which is 120 other side)
                targets = [0, 120, 180, 240]
                
                for target in targets:
                    # We check if diff crossed target
                    # Be careful of 360 wrap-around
                    # Simple way: check absolute difference from target
                    d_prev = min(abs(diff_prev - target), 360 - abs(diff_prev - target)) # Shortest distance to target
                    d_next = min(abs(diff_next - target), 360 - abs(diff_next - target)) 
                    
                    # If we crossed, the sign of (diff - target) might change, OR wrapping happened.
                    # Robust way: If shortest arc distance decreases then increases? No, that's min point.
                    # Crossing: one is 'before', one is 'after'.
                    # Or simpler: if diff_prev < target < diff_next (handling wrap)
                    
                    # Let's use a function to determine if 'target' is strictly between angle1 and angle2 in the shortest path direction.
                    # Actually, since step is small (6h), movement is small (< 8 deg for moon, < 1 deg for others).
                    # We can normalize so that current is 0.
                    
                    # Angle between prev and next is small.
                    # We can model movement linearly.
                    # relative_speed = (diff_next - diff_prev) (handled for wrap)
                    
                    # Let's simplify:
                    # If abs(diff_prev - target) + abs(diff_next - target) is roughly abs(diff_prev - diff_next)? No.
                    
                    # Correct Robust Way:
                    # diff_prev and diff_next are in [0, 360).
                    # We want to know if 'target' was crossed.
                    # Normalize everything to be relative to target?
                    # Let val_prev = (diff_prev - target + 180) % 360 - 180  Output [-180, 180]
                    # Let val_next = (diff_next - target + 180) % 360 - 180
                    # If val_prev and val_next have different signs, AND abs(val_prev - val_next) < 180, then crossed.
                    
                    val_prev = (diff_prev - target + 180) % 360 - 180
                    val_next = (diff_next - target + 180) % 360 - 180
                    
                    if (val_prev * val_next < 0) and abs(val_prev - val_next) < 180:
                        # Crossed!
                        # Interpolate time
                        fraction = abs(val_prev) / (abs(val_prev) + abs(val_next))
                        exact_jd = current_jd + step * fraction
                        
                        # Event details
                        dt_cross = swe.revjul(exact_jd)
                        e_date = datetime(dt_cross[0], dt_cross[1], dt_cross[2], int(dt_cross[3]), int((dt_cross[3]%1)*60), tzinfo=pytz.utc)
                        ist_date = e_date.astimezone(pytz.timezone('Asia/Kolkata'))
                        
                        # Pos at exact time
                        p1_pos_exact, _ = get_planet_position_speed(exact_jd, p1, PLANETS[p1])
                        # p2_pos_exact same...
                        
                        deg_str = format_degree(p1_pos_exact % 30)
                        sign_str = ZODIAC_SIGNS[int(p1_pos_exact / 30)]
                        
                        aspect_name = "Conjunction" if target == 0 else "Opposition" if target == 180 else "Trine (120)"
                        
                        events.append({
                            "date": ist_date.isoformat(),
                            "display_date": ist_date.strftime("%d %b %Y"),
                            "time": ist_date.strftime("%I:%M %p"),
                            "type": aspect_name,
                            "event_name": f"{p1} - {p2} {aspect_name}",
                            "degree": f"{sign_str} {deg_str}"
                        })
        
        prev_positions = next_positions
        current_jd = next_jd
    
    # 3. TRANSITS (Sign Changes) - Exclude Moon
    # Step through the month to detect when planets change signs
    
    transit_planets = [(n, p) for n, p in PLANETS.items() if n != 'Moon']
    
    for name, pid in transit_planets:
        current_jd = start_jd
        
        # Get initial position and sign
        if name == 'Ketu':
            rahu_pos = swe.calc_ut(current_jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
            curr_pos = (rahu_pos + 180) % 360
        else:
            curr_pos = swe.calc_ut(current_jd, pid, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
        
        curr_sign = get_sign_from_longitude(curr_pos)
        
        # Step size: 1 day for most planets
        step = 1.0
        
        while current_jd < end_jd:
            next_jd = current_jd + step
            
            if name == 'Ketu':
                rahu_pos = swe.calc_ut(next_jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                next_pos = (rahu_pos + 180) % 360
            else:
                next_pos = swe.calc_ut(next_jd, pid, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
            
            next_sign = get_sign_from_longitude(next_pos)
            
            if curr_sign != next_sign:
                # Sign change detected! Binary search for precise time
                left, right = current_jd, next_jd
                ingress_jd = right
                target_sign = next_sign
                
                for _ in range(10):
                    mid = (left + right) / 2
                    if name == 'Ketu':
                        r_p = swe.calc_ut(mid, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                        mid_pos = (r_p + 180) % 360
                    else:
                        mid_pos = swe.calc_ut(mid, pid, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                    
                    mid_sign = get_sign_from_longitude(mid_pos)
                    
                    if mid_sign == target_sign:
                        right = mid
                        ingress_jd = mid
                    else:
                        left = mid
                
                # Convert to datetime
                dt_ingress = swe.revjul(ingress_jd)
                year_i, month_i, day_i, hour_float = dt_ingress[0], dt_ingress[1], dt_ingress[2], dt_ingress[3]
                
                h = int(hour_float)
                m = int((hour_float - h) * 60)
                s = int(((hour_float - h) * 60 - m) * 60)
                
                ingress_dt_utc = datetime(year_i, month_i, day_i, h, m, s, tzinfo=pytz.utc)
                ist_date = ingress_dt_utc.astimezone(pytz.timezone('Asia/Kolkata'))
                
                # Get position for degree display
                if name == 'Ketu':
                    r_p = swe.calc_ut(ingress_jd, swe.MEAN_NODE, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                    pos_at_ingress = (r_p + 180) % 360
                else:
                    pos_at_ingress = swe.calc_ut(ingress_jd, pid, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)[0][0]
                
                deg_str = format_degree(pos_at_ingress % 30)
                sign_str = ZODIAC_SIGNS[next_sign]
                
                events.append({
                    "date": ist_date.isoformat(),
                    "display_date": ist_date.strftime("%d %b %Y"),
                    "time": ist_date.strftime("%I:%M %p"),
                    "type": "Transit",
                    "event_name": f"{name} enters {sign_str}",
                    "degree": f"{sign_str} {deg_str}"
                })
                
                curr_sign = next_sign
            
            current_jd = next_jd
            curr_pos = next_pos
        
    events.sort(key=lambda x: x['date'])
    return events
