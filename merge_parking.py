"""
merge_parking.py
Run from your project root:  python3 merge_parking.py

Fixes two problems:
1. Also queries building=parking / parking=garage etc (not just amenity=parking)
   so named garages like "Olympic Garage" that OSM tags differently are included.
2. Skips city GeoJSON coords — those are Washington State Plane feet, not lat/lng.
"""

import json, urllib.request, urllib.parse

# ── 1. Fetch OSM data ──────────────────────────────────────────────────────────
print("Fetching Greater Seattle parking from Overpass API...")
BBOX = "47.35,-122.55,47.85,-122.00"
query = f"""[out:json][timeout:90];
(
  node["amenity"="parking"]({BBOX});
  way["amenity"="parking"]({BBOX});
  node["building"="parking"]({BBOX});
  way["building"="parking"]({BBOX});
  way["parking"="garage"]({BBOX});
  way["parking"="multi-storey"]({BBOX});
  way["parking"="underground"]({BBOX});
);
out center;"""

data = urllib.parse.urlencode({'data': query}).encode()
req = urllib.request.Request(
    'https://overpass-api.de/api/interpreter', data=data,
    headers={'User-Agent': 'SeattleParkingApp/1.0'}
)
with urllib.request.urlopen(req, timeout=90) as resp:
    osm = json.loads(resp.read())

print(f"  Got {len(osm['elements'])} OSM elements")

# ── 2. Map OSM tags → our type ────────────────────────────────────────────────
def osm_to_type(tags):
    p  = tags.get('parking', '').lower()
    b  = tags.get('building', '').lower()
    if p in ('multi-storey', 'multistorey') or b == 'parking': return 'multi-storey'
    if p == 'underground':                                       return 'underground'
    if p == 'street_side':                                       return 'street_side'
    if p in ('surface', 'ground_level'):                         return 'surface'
    # fallback: check levels
    try:
        lvl = int(tags.get('building:levels') or tags.get('levels') or 1)
        if lvl > 1: return 'multi-storey'
    except: pass
    return 'surface'

# ── 3. Convert OSM elements → spot objects ────────────────────────────────────
osm_spots = []
for el in osm['elements']:
    tags = el.get('tags', {})
    if el['type'] == 'node':
        lat, lng = el['lat'], el['lon']
    elif el['type'] == 'way' and 'center' in el:
        lat, lng = el['center']['lat'], el['center']['lon']
    else:
        continue

    # Sanity check: must be valid WGS84 coords
    if not (47.0 < lat < 48.5 and -123.0 < lng < -121.5):
        continue

    name   = tags.get('name') or tags.get('operator') or 'Parking'
    stalls = None
    try:   stalls = int(tags.get('capacity', 0)) or None
    except: pass

    osm_spots.append({
        'id':       f"osm-{el['type']}-{el['id']}",
        'name':     name,
        'type':     osm_to_type(tags),
        'lat':      lat,
        'lng':      lng,
        'address':  tags.get('addr:full') or tags.get('addr:street', ''),
        'stalls':   stalls,
        'rate_1hr': None,
    })

print(f"  Converted {len(osm_spots)} valid OSM spots")

# ── 4. Load existing parking_lots.json ────────────────────────────────────────
existing_path = 'src/parking_lots.json'
with open(existing_path) as f:
    existing = json.load(f)

# Filter out any existing entries with invalid coords (State Plane leftovers)
before = len(existing)
existing = [s for s in existing if 47.0 < s.get('lat',0) < 48.5 and -123.0 < s.get('lng',0) < -121.5]
removed = before - len(existing)
if removed:
    print(f"  Removed {removed} entries with invalid coordinates")
print(f"  Valid existing spots: {len(existing)}")

# ── 5. Merge (dedupe by lat/lng rounded to 4dp) ───────────────────────────────
existing_coords = {(round(s['lat'],4), round(s['lng'],4)) for s in existing}
added = 0
for spot in osm_spots:
    key = (round(spot['lat'],4), round(spot['lng'],4))
    if key not in existing_coords:
        existing.append(spot)
        existing_coords.add(key)
        added += 1

print(f"  Added {added} new spots from OSM")
print(f"  Total: {len(existing)} spots")

# ── 6. Save ───────────────────────────────────────────────────────────────────
with open(existing_path, 'w') as f:
    json.dump(existing, f, indent=2)
print(f"\nDone! Written to {existing_path}")
print("Next: git add src/parking_lots.json && git commit -m 'data: full OSM merge incl garages' && git push")
