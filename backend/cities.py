"""
Cities database loader and search module.
Uses Geonames cities15000 dataset for fast local city search.
"""

import os
from pathlib import Path
from typing import List, Dict, Optional

# Path to cities data file
CITIES_FILE = Path(__file__).parent / "cities15000.txt"

# Cache for loaded cities
_cities_cache: Optional[List[Dict]] = None

def load_cities() -> List[Dict]:
    """
    Load cities from Geonames cities15000.txt file.
    File format is tab-separated with these columns:
    0: geonameid, 1: name, 2: asciiname, 3: alternatenames, 4: latitude,
    5: longitude, 6: feature class, 7: feature code, 8: country code,
    9: cc2, 10: admin1 code, 11: admin2 code, 12: admin3 code, 13: admin4 code,
    14: population, 15: elevation, 16: dem, 17: timezone, 18: modification date
    """
    global _cities_cache
    
    if _cities_cache is not None:
        return _cities_cache
    
    cities = []
    
    if not CITIES_FILE.exists():
        print(f"Warning: Cities file not found at {CITIES_FILE}")
        return cities
    
    with open(CITIES_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) >= 18:
                try:
                    cities.append({
                        "name": parts[1],
                        "ascii_name": parts[2].lower(),  # For search
                        "country": parts[8],
                        "lat": float(parts[4]),
                        "lon": float(parts[5]),
                        "timezone": parts[17],
                        "population": int(parts[14]) if parts[14] else 0
                    })
                except (ValueError, IndexError):
                    continue
    
    # Sort by population (larger cities first for better search results)
    cities.sort(key=lambda x: x['population'], reverse=True)
    _cities_cache = cities
    print(f"Loaded {len(cities)} cities from Geonames database")
    return cities


def search_cities(query: str, limit: int = 10) -> List[Dict]:
    """
    Search cities by name prefix or substring.
    Returns cities sorted by population (larger cities first).
    """
    if not query or len(query) < 2:
        return []
    
    cities = load_cities()
    query_lower = query.lower()
    
    # First pass: exact prefix matches (highest priority)
    prefix_matches = []
    # Second pass: word-start matches
    word_matches = []
    # Third pass: substring matches
    substring_matches = []
    
    for city in cities:
        ascii_name = city['ascii_name']
        
        if ascii_name.startswith(query_lower):
            prefix_matches.append(city)
        elif f" {query_lower}" in f" {ascii_name}":
            # Word boundary match
            word_matches.append(city)
        elif query_lower in ascii_name:
            substring_matches.append(city)
        
        # Early exit if we have enough prefix matches
        if len(prefix_matches) >= limit:
            break
    
    # Combine results, prioritizing prefix matches
    results = prefix_matches[:limit]
    remaining = limit - len(results)
    
    if remaining > 0:
        results.extend(word_matches[:remaining])
        remaining = limit - len(results)
    
    if remaining > 0:
        results.extend(substring_matches[:remaining])
    
    # Return clean results (without search fields)
    return [
        {
            "name": c["name"],
            "country": c["country"],
            "lat": c["lat"],
            "lon": c["lon"],
            "timezone": c["timezone"]
        }
        for c in results[:limit]
    ]


# Country code to name mapping (common countries)
COUNTRY_NAMES = {
    "IN": "India", "US": "United States", "GB": "United Kingdom", 
    "CA": "Canada", "AU": "Australia", "DE": "Germany", "FR": "France",
    "IT": "Italy", "ES": "Spain", "BR": "Brazil", "JP": "Japan",
    "CN": "China", "RU": "Russia", "MX": "Mexico", "KR": "South Korea",
    "ID": "Indonesia", "NL": "Netherlands", "TR": "Turkey", "SA": "Saudi Arabia",
    "CH": "Switzerland", "PL": "Poland", "BE": "Belgium", "SE": "Sweden",
    "AT": "Austria", "NO": "Norway", "DK": "Denmark", "FI": "Finland",
    "IE": "Ireland", "NZ": "New Zealand", "SG": "Singapore", "HK": "Hong Kong",
    "AE": "UAE", "ZA": "South Africa", "EG": "Egypt", "TH": "Thailand",
    "MY": "Malaysia", "PH": "Philippines", "VN": "Vietnam", "PK": "Pakistan",
    "BD": "Bangladesh", "NG": "Nigeria", "AR": "Argentina", "CL": "Chile",
    "CO": "Colombia", "PE": "Peru", "VE": "Venezuela", "PT": "Portugal",
    "GR": "Greece", "CZ": "Czech Republic", "HU": "Hungary", "RO": "Romania",
    "UA": "Ukraine", "IL": "Israel", "IR": "Iran", "IQ": "Iraq"
}


def get_country_name(code: str) -> str:
    """Get country name from country code."""
    return COUNTRY_NAMES.get(code, code)
