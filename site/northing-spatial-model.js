/* =====================================================================
   NORTHING — SHARED INTERNAL SPATIAL MODEL  (single source of truth)
   ---------------------------------------------------------------------
   Loaded by BOTH tools as a classic <script src> BEFORE their main script:
     - sequence-deck-builder.html
     - clip-prompt-generator.html
   Classic script (NOT an ES module) on purpose, so it loads when the tools
   are opened directly as local file:// pages. It defines two globals:
   NORTHING_SPATIAL_MODEL and NORTHING_SPATIAL_CONFIG.

   This file is the ONLY place the topology lives. Edit geography here once;
   both tools pick it up. Do not re-embed a copy in either HTML file.

   INTERNAL CONSISTENCY TOOL. Not public canon, not a published artifact,
   not a survey. APPROXIMATE relative positions only. RO-001 orients the
   landscape; it is not omniscient (FC-001 and HS-001 lie beyond its viewshed).

   CORRECTED TOPOLOGY (formal decision 2026-06-01, canon authoritative):
   BM-001 is a mid-section beaver impoundment on the EASTERN tributary,
   UPSTREAM of the TC-001 confluence — not the lowest, downstream-most site.
   The watershed is BRANCHED, not a single chain HS→FC→TC→BM.
   ===================================================================== */

var NORTHING_SPATIAL_CONFIG = {
  internalOrientationMap: "/90 media/INTERNAL-USE-ONLY-Northing-map-v2.png"
};

var NORTHING_SPATIAL_MODEL = {
  meta:{
    status:'internal',
    version:'1.2',
    source:'/90 media/INTERNAL-USE-ONLY-Northing-map-v2.png (v2, 2026-06-01). v2 illustration now matches canon: BM-001 on the eastern tributary upstream of TC-001, branched watershed. v1 renamed /90 media/v1-northing-map-superceded-by-v2.png (superseded).',
    confidence:'approximate',
    drainageDirection:'Main watercourse N→S. BRANCHED: western tributary (HS→FC→main) and eastern tributary (BM) converge at the TC-001 confluence; outlet continues to the lower wetland complex below TC-001.',
    prevailingWind:'NW → SE',
    notice:'Internal use only. Approximate relative positions; no surveyed certainty. '+
           'Not public canon and not for audience-facing decks. Constrains sequencing, not narration.',
    precedence:'Location canon is authoritative over this internal map (formal decision 2026-06-01). The map is a later, approximate consistency aid, not a survey.',
    // BM↔TC conflict resolved in favour of canon and corrected in-model. No active conflicts.
    conflicts:[],
    corrections:[
      {id:'bm-hydro-position', date:'2026-06-01', decision:'canon authoritative',
       summary:'BM-001 corrected to its canon position: mid-section eastern-tributary impoundment, UPSTREAM of TC-001.',
       wasMap:'BM as lowest/downstream-most (~460 m, below TC-001) on a single-stem chain HS→FC→TC→BM.',
       nowModel:'Branched topology: western tributary (HS→FC) and eastern tributary (BM) both descend to the TC-001 confluence; below TC-001 is the (uncarded) lower wetland.',
       changed:'BM elevation rank moved above TC; hydroOrder chain replaced with a directed flow graph; sequencing modes regenerated.'},
      {id:'map-v2-adoption', date:'2026-06-01', decision:'map redrawn to match canon',
       summary:'Internal orientation map v2 adopted as source; v2 depicts BM-001 on the eastern tributary upstream of TC-001.',
       wasMap:'v1 PNG (single-stem HS→FC→TC→BM, BM lowest). Renamed v1-northing-map-superceded-by-v2.png.',
       nowModel:'v2 PNG matches the already-corrected branched model; approximate elevations synced (FC ~560, TC ~500, BM ~580, lower wetland ~460).',
       changed:'meta.source and elevApprox/elevationRank updated to v2 values. Topology and sequencing modes unchanged (already correct).'}
    ],
    notes:[
      'HS-001 and FC-001 are western-tributary; whether they lie on the same stream is canonically undetermined (location-006). Modelled as western-system neighbours.',
      'The carded set models one western headwater (HS-001); canon allows additional unnamed tributary sources elsewhere in the watershed.',
      'The lowest zone is the lower wetland complex below TC-001 (~460 m per map v2; no card). BM-001 (~580 m) is NOT the lowest point.'
    ]
  },
  // branch: 'overlook' (above all) | 'west' | 'confluence' | 'east'
  // elevApprox: approximate metres, relative only. elevationRank: 1 = highest.
  // Cross-branch elevation (west vs east) is not canonically comparable except via TC / RO.
  locations:{
    'RO-001':{name:'Ridge Overlook', code:'RO', govern:'Orientation', branch:'overlook',
      system:'western ridgeline (orientation point above the whole watershed)',
      elevApprox:760, elevationRank:1, tier:'ridge',
      elevation:'highest northern ridge',
      fog:'above fog', fogRank:0, wind:'highest exposure', shelter:'exposed',
      viewshedFromRO:'self'},
    'AO-001':{name:'Abandoned Hillside Orchard', code:'AO', govern:'Persistence', branch:'west',
      system:'western bench',
      elevApprox:640, elevationRank:2, tier:'bench',
      elevation:'orchard bench below ridge, south/southwest-facing',
      fog:'often above valley fog', fogRank:1, wind:'moderate exposure', shelter:'partial',
      viewshedFromRO:'visible'},
    'SF-001':{name:'Stone Foundation Clearing', code:'SF', govern:'Reclamation', branch:'west',
      system:'western bench / terrace',
      elevApprox:620, elevationRank:3, tier:'bench',
      elevation:'separate foundation bench or terrace',
      fog:'partially sheltered; sometimes above fog', fogRank:1, wind:'sheltered to moderate', shelter:'partial',
      viewshedFromRO:'occasional/partial'},
    'HS-001':{name:'Headwater Spring', code:'HS', govern:'Emergence', branch:'west',
      system:'western tributary — seep-fed headwater (emergence zone)',
      elevApprox:600, elevationRank:4, tier:'upper-western-tributary',
      elevation:'western-slope spring emergence, upstream terminus of a seep-fed tributary',
      fog:'sheltered and cool', fogRank:1, wind:'sheltered', shelter:'sheltered',
      viewshedFromRO:'not visible'},
    'FC-001':{name:'Forest Crossing', code:'FC', govern:'Passage', branch:'west',
      system:'western tributary — ravine-head crossing',
      elevApprox:560, elevationRank:6, tier:'western-tributary',
      elevation:'ravine-head crossing on a western-slope seep-fed stream',
      fog:'sheltered drainage interior', fogRank:1, wind:'sheltered', shelter:'sheltered',
      viewshedFromRO:'not visible'},
    'TC-001':{name:'Tributary Confluence Wet Meadow', code:'TC', govern:'Convergence', branch:'confluence',
      system:'confluence — eastern tributary meets the main watercourse (lower third)',
      elevApprox:500, elevationRank:7, tier:'valley-confluence',
      elevation:'alluvial confluence; lower wetland begins just downstream',
      fog:'valley / confluence fog (forms first near the tributary outlet)', fogRank:2,
      wind:'moderate valley exposure', shelter:'moderate',
      viewshedFromRO:'seasonal/weather-dependent'},
    'BM-001':{name:'Beaver Meadow', code:'BM', govern:'Transformation', branch:'east',
      system:'eastern tributary — mid-section beaver impoundment, upstream of TC-001',
      elevApprox:580, elevNote:'≈580 m per map v2; above TC-001 (upstream of the confluence); cross-branch elevation not directly comparable to western sites',
      elevationRank:5, tier:'eastern-tributary',
      elevation:'mid-section eastern-tributary impoundment, upstream of the TC-001 confluence, behind the interior secondary ridge',
      fog:'strong pond-surface fog (open-water mechanism) plus local cold-air pooling; not the watershed’s lowest cold-air sink (that is the lower wetland)', fogRank:3,
      wind:'locally open over the water, but valley-confined and largely sheltered from prevailing NW behind the interior secondary ridge', shelter:'valley-confined',
      viewshedFromRO:'frequent/clear'}
  },
  // Directed flow graph (upstream → downstream). LOWER-WETLAND is an uncarded sink.
  hydrology:{
    drainageDirection:'branched; west and east tributaries converge at TC-001, then to the lower wetland',
    flow:[
      ['HS-001','FC-001'],        // western tributary
      ['FC-001','TC-001'],        // western tributary → main watercourse → confluence
      ['BM-001','TC-001'],        // eastern tributary → confluence
      ['TC-001','LOWER-WETLAND']  // outlet (uncarded)
    ]
  },
  viewshedFrom:{
    'RO-001':{ 'BM-001':'frequent/clear', 'TC-001':'seasonal/weather-dependent',
      'AO-001':'visible', 'SF-001':'occasional/partial',
      'FC-001':'not visible', 'HS-001':'not visible' }
  },
  // Approximate likely traverse adjacencies (relative neighbours, not routed paths).
  // TC–BM remains adjacent: BM connects to TC by descending the eastern tributary
  // to the confluence, or by crossing the interior secondary ridge from the main valley.
  traverse:[
    ['RO-001','AO-001'], ['RO-001','SF-001'], ['AO-001','SF-001'],
    ['AO-001','HS-001'], ['AO-001','TC-001'], ['SF-001','TC-001'],
    ['HS-001','FC-001'], ['FC-001','TC-001'], ['TC-001','BM-001']
  ],
  sequencingModes:[
    {id:'watershed', name:'Watershed sequence',   note:'HS → FC → TC (western tributary to confluence)',
      steps:['HS-001','FC-001','TC-001']},
    {id:'eastern',   name:'Eastern tributary',    note:'BM → TC (eastern impoundment down to confluence)',
      steps:['BM-001','TC-001']},
    {id:'descent',   name:'Elevation descent',    note:'RO → AO/SF → HS → FC → TC',
      steps:['RO-001',['AO-001','SF-001'],'HS-001','FC-001','TC-001']},
    {id:'viewshed',  name:'Viewshed-to-ground',   note:'RO → AO → BM (ridge to clearly-visible eastern valley floor)',
      steps:['RO-001','AO-001','BM-001']},
    {id:'hidden',    name:'Hidden drainage',      note:'HS → FC (reaches beyond RO viewshed)',
      steps:['HS-001','FC-001']},
    {id:'bench',     name:'Bench-to-valley',      note:'AO/SF → TC (western benches to the valley confluence)',
      steps:[['AO-001','SF-001'],'TC-001']}
  ]
};

/* Expose on window so any tool (and the deck builder's existing reference) can share it. */
try { if (typeof window !== 'undefined') { window.NORTHING_SPATIAL_MODEL = NORTHING_SPATIAL_MODEL; window.NORTHING_SPATIAL_CONFIG = NORTHING_SPATIAL_CONFIG; } } catch (e) {}
