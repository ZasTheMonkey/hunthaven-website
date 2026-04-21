// ── Florida FWC Regulations 2025–2026 ────────────────────────
// Source: myfwc.com — seasons/dates do NOT apply to WMAs.
// Private land regulations only.

// County → Deer Zone mapping
// Zone A = South Florida (below ~SR-70 corridor, mostly)
// Zone B = Central peninsula east (Brevard, Indian River, Okeechobee, St. Lucie, Martin, Palm Beach, Broward, Miami-Dade, Monroe)
// Zone C = Central Florida (large middle belt, C1–C6)
// Zone D = North Florida / Panhandle
var FL_COUNTY_ZONE = {
  // Zone A — South / Southwest Florida
  'Broward':      'A', 'Charlotte':  'A', 'Collier':    'A',
  'Glades':       'A', 'Hendry':     'A', 'Highlands':  'A',
  'Lee':          'A', 'Miami-Dade': 'A', 'Monroe':     'A',
  'Palm Beach':   'A',

  // Zone B — Central-East / South-Central Peninsula
  'Brevard':      'B', 'Indian River':'B', 'Martin':    'B',
  'Okeechobee':   'B', 'Osceola':    'B', 'St. Lucie': 'B',

  // Zone C — Central Florida belt
  'Alachua':      'C', 'Baker':      'C', 'Bradford':   'C',
  'Citrus':       'C', 'Clay':       'C', 'Columbia':   'C',
  'DeSoto':       'C', 'Duval':      'C', 'Flagler':    'C',
  'Gilchrist':    'C', 'Hamilton':   'C', 'Hardee':     'C',
  'Hernando':     'C', 'Hillsborough':'C','Jefferson':  'C',
  'Lake':         'C', 'Levy':       'C', 'Madison':    'C',
  'Manatee':      'C', 'Marion':     'C', 'Nassau':     'C',
  'Orange':       'C', 'Pasco':      'C', 'Pinellas':   'C',
  'Polk':         'C', 'Putnam':     'C', 'Sarasota':   'C',
  'Seminole':     'C', 'St. Johns':  'C', 'Sumter':     'C',
  'Suwannee':     'C', 'Taylor':     'C', 'Union':      'C',
  'Volusia':      'C',

  // Zone D — North Florida / Panhandle
  'Bay':          'D', 'Calhoun':    'D', 'Dixie':      'D',
  'Escambia':     'D', 'Franklin':   'D', 'Gadsden':    'D',
  'Gulf':         'D', 'Holmes':     'D', 'Jackson':    'D',
  'Lafayette':    'D', 'Leon':       'D', 'Liberty':    'D',
  'Okaloosa':     'D', 'Santa Rosa': 'D', 'Wakulla':    'D',
  'Walton':       'D', 'Washington': 'D'
};

// Season dates by deer zone (2025-2026)
var FL_DEER_SEASONS = {
  A: {
    archery:    'Aug 2 – Aug 31',
    crossbow:   'Aug 2 – Sep 5',
    muzzleloader:'Sep 6 – Sep 19',
    general_gun:'Sep 20 – Oct 19 & Nov 22 – Jan 4',
    youth:      'Sep 13–14',
    bag:        '2/day · 5/season (max 2 antlerless)',
    note:       'Check DMU A2/A3 for antlerless-only dates. Antler point regs vary by DMU.'
  },
  B: {
    archery:    'Oct 18 – Nov 16',
    crossbow:   'Oct 18 – Nov 21',
    muzzleloader:'Nov 22 – Dec 5',
    general_gun:'Dec 6 – Feb 22',
    youth:      'Nov 29–30',
    bag:        '2/day · 5/season (max 2 antlerless)',
    note:       'Antler point regs: 2 points on one side (DMU B1).'
  },
  C: {
    archery:    'Sep 13 – Oct 12',
    crossbow:   'Sep 13 – Oct 17',
    muzzleloader:'Oct 18 – Oct 31',
    general_gun:'Nov 1 – Jan 18 (varies by DMU C1–C6)',
    youth:      'Oct 25–26',
    bag:        '2/day · 5/season (max 2 antlerless)',
    note:       'Antler point regs vary by DMU (C3–C6 require 2–3 points on one side). Verify your DMU at myfwc.com.'
  },
  D: {
    archery:    'Oct 25 – Nov 26',
    crossbow:   'Oct 25 – Nov 26 & Dec 1–5',
    muzzleloader:'Dec 6 – Dec 12',
    general_gun:'Nov 27–30 & Dec 13 – Feb 22',
    youth:      'Dec 6–7',
    bag:        '2/day · 5/season (max 2 antlerless in D1; 3 in D2)',
    note:       'DMU D2: 3 antlerless allowed. Antler regs: 2 pts one side (D1), 3 pts or 10" beam (D2).'
  }
};

// Species regulations (statewide unless noted)
var FL_SPECIES_REGS = {
  'Wild hog': {
    season:   'Year-round on private land',
    bag:      'No limit',
    license:  'Hunting license required',
    note:     'No closed season on private land with landowner permission. Night hunting allowed on private land.'
  },
  'Wild turkey': {
    season:   'Spring: Mar 7 – Apr 12 (south of SR-70) · Mar 21 – Apr 26 (north of SR-70)\nFall: varies by zone/WMA (archery/crossbow only some areas)',
    bag:      '2 bearded turkeys/spring season',
    license:  'Hunting license required',
    note:     'Youth spring turkey: Feb 27–Mar 2 (south) / Mar 13–16 (north). Shooting hours: ½ hr before sunrise to sunset.'
  },
  'Duck / waterfowl': {
    season:   'Early teal: Sep 20–24 · Regular: Nov 22–30 & Dec 6 – Jan 25',
    bag:      '6 ducks/day (species sub-limits apply: 1 mottled duck, 3 wood ducks, 3 pintails, etc.)',
    license:  'Hunting license + Migratory Bird Permit + FL Waterfowl Permit + Federal Duck Stamp required',
    note:     'Leon County & Lake Miccosukee: Wed/Sat/Sun only during regular season. Shooting hours: ½ hr before sunrise to sunset.'
  },
  'Dove': {
    season:   'Sep 27 – Oct 19 · Nov 8–30 · Dec 19 – Jan 31',
    bag:      '15 mourning/white-winged doves/day · 45 possession',
    license:  'Hunting license + Migratory Bird Permit required',
    note:     'Shooting hours: ½ hr before sunrise to sunset.'
  },
  'Quail': {
    season:   'Nov 9, 2025 – Mar 2, 2026',
    bag:      '12 bobwhite quail/day · 24 possession',
    license:  'Hunting license required',
    note:     'Statewide season on private land.'
  },
  'Bass fishing': {
    season:   'Year-round',
    bag:      '5 black bass/day (only 1 may be ≥16")',
    size:     'No minimum length for largemouth/Florida bass',
    license:  'Freshwater fishing license required',
    note:     'All black bass species count toward the 5-fish aggregate. TrophyCatch program allows temporary possession of trophy fish for documentation.'
  },
  'Trout / fly fishing': {
    season:   'Year-round (freshwater)',
    bag:      'Check FWC for specific trout species limits',
    license:  'Freshwater fishing license required',
    note:     'Suwannee bass: 12" minimum. No possession of shoal bass on Chipola River. Verify species-specific rules at myfwc.com.'
  },
  'Catfish pond': {
    season:   'Year-round',
    bag:      'No bag limit (nongame fish)',
    license:  'Freshwater fishing license required',
    note:     'Catfish are classified as nongame fish in Florida — no state bag or size limit on private ponds.'
  },
  'Crappie / bream': {
    season:   'Year-round',
    bag:      'Crappie: 25/day · Panfish/bream: 50/day',
    license:  'Freshwater fishing license required',
    note:     'Panfish includes: bluegill, shellcracker, warmouth, stumpknocker, redbreast, flier, mud sunfish, longear sunfish.'
  }
};

// Build regulations HTML for a listing
function getFLRegulationsHtml(listing) {
  var activities = listing.activities || [];
  if (!activities.length) return '';

  var county = (listing.county || '').replace(' County', '').trim();
  var zone = FL_COUNTY_ZONE[county] || null;

  var sections = [];

  // Deer — zone-based
  var hasDeer = activities.some(function(a){ return /deer/i.test(a); });
  if (hasDeer) {
    var zoneData = zone ? FL_DEER_SEASONS[zone] : null;
    if (zoneData) {
      sections.push({
        icon: '&#127981;',
        title: 'Whitetail Deer — Zone ' + zone + ' (2025–26)',
        rows: [
          ['Archery',       zoneData.archery],
          ['Crossbow',      zoneData.crossbow],
          ['Muzzleloader',  zoneData.muzzleloader],
          ['General Gun',   zoneData.general_gun],
          ['Youth Weekend', zoneData.youth],
          ['Bag Limit',     zoneData.bag]
        ],
        note: zoneData.note
      });
    } else {
      sections.push({
        icon: '&#127981;',
        title: 'Whitetail Deer',
        rows: [['Season dates', 'Verify at myfwc.com — zone not determined for this county']],
        note: ''
      });
    }
  }

  // All other species
  var speciesMap = {
    'Wild hog':          'Wild hog',
    'Wild turkey':       'Wild turkey',
    'Duck / waterfowl':  'Duck / waterfowl',
    'Dove':              'Dove',
    'Quail':             'Quail',
    'Bass fishing':      'Bass fishing',
    'Trout / fly fishing':'Trout / fly fishing',
    'Catfish pond':      'Catfish pond',
    'Crappie / bream':   'Crappie / bream'
  };

  activities.forEach(function(act) {
    var key = speciesMap[act];
    if (!key) return;
    var reg = FL_SPECIES_REGS[key];
    if (!reg) return;
    var rows = [['Season', reg.season]];
    if (reg.bag)  rows.push(['Bag Limit', reg.bag]);
    if (reg.size) rows.push(['Size Limit', reg.size]);
    rows.push(['License', reg.license]);
    sections.push({ icon: '', title: act, rows: rows, note: reg.note || '' });
  });

  if (!sections.length) return '';

  var rowsHtml = function(rows) {
    return rows.map(function(r) {
      return '<div style="display:flex;gap:.5rem;padding:.28rem 0;border-bottom:1px solid var(--color-border);font-size:.8rem">' +
        '<span style="flex:0 0 90px;font-weight:700;color:var(--color-text-muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.04em;padding-top:.05rem">' + r[0] + '</span>' +
        '<span style="flex:1;color:var(--color-text);line-height:1.45;white-space:pre-line">' + r[1] + '</span>' +
        '</div>';
    }).join('');
  };

  var cardsHtml = sections.map(function(s) {
    return '<div style="margin-bottom:.6rem;border:1px solid var(--color-border);border-radius:10px;overflow:hidden">' +
      '<div style="background:var(--color-surface-offset);padding:.5rem .85rem;display:flex;align-items:center;gap:.4rem">' +
        (s.icon ? '<span style="font-size:.95rem">' + s.icon + '</span>' : '') +
        '<span style="font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--color-text)">' + escHtml(s.title) + '</span>' +
      '</div>' +
      '<div style="padding:.5rem .85rem">' +
        rowsHtml(s.rows) +
        (s.note ? '<p style="font-size:.75rem;color:var(--color-text-muted);margin-top:.45rem;line-height:1.5;font-style:italic">' + escHtml(s.note) + '</p>' : '') +
      '</div>' +
    '</div>';
  }).join('');

  return '<div style="margin-top:.85rem;margin-bottom:.75rem">' +
    '<div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.55rem">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
      '<span style="font-size:.72rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:var(--color-text-muted)">Florida FWC Regulations (2025–26)</span>' +
    '</div>' +
    cardsHtml +
    '<p style="font-size:.7rem;color:var(--color-text-faint);text-align:center;margin-top:.4rem">' +
      'Seasons do not apply to WMAs. Always verify at <a href="https://myfwc.com" target="_blank" rel="noopener" style="color:var(--color-accent)">myfwc.com</a> before hunting or fishing.' +
    '</p>' +
  '</div>';
}
