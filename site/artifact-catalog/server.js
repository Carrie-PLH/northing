require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Database ────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Locations reference ──────────────────────────────────────────────────────

const LOCATIONS = {
  '001': 'Tributary Confluence Wet Meadow',
  '002': 'Abandoned Hillside Orchard',
  '003': 'Forest Crossing',
  '004': 'Beaver Meadow',
  '005': 'Stone Foundation Clearing',
  '006': 'Headwater Spring',
  '007': 'Ridge Overlook',
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_ARTIFACTS = [
  // ── 001 Tributary Confluence Wet Meadow ──────────────────────────────────
  { location_id: '001', title: 'Ice auger', type: 'photograph', period: 'mid-20th century', arena_url: 'https://www.are.na/block/46573062', description: null },
  { location_id: '001', title: 'Boundary stake survey: four polaroids', type: 'scrapbook page', period: 'late 20th century', arena_url: 'https://www.are.na/block/46572929', description: null },
  { location_id: '001', title: 'Field notes', type: 'field notes', period: 'undated', arena_url: 'https://www.are.na/block/46571427', description: null },
  { location_id: '001', title: 'Confluence channel geometry sketch', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Hand-drawn plan of the confluence showing both channels and gravel bar positions at low water.' },
  { location_id: '001', title: 'Water level log: seasonal readings', type: 'measurement log', period: 'mid-20th century', arena_url: null, description: 'Handwritten table of water level readings taken against a fixed bank reference, across seasons.' },
  { location_id: '001', title: 'Ice thickness record', type: 'measurement log', period: 'undated', arena_url: null, description: 'Winter log of ice thickness at crossing point and open leads near confluence junction.' },
  { location_id: '001', title: 'Spring flood high-water marks', type: 'observation record', period: 'recurring, undated', arena_url: null, description: 'Annual notations of flood extent on bank stake; comparison across years noted in margin.' },
  { location_id: '001', title: 'Waterbird arrival log: spring', type: 'observation record', period: 'late 20th century', arena_url: null, description: 'Species list and first-arrival dates for migratory waterbirds at the flooded meadow.' },
  { location_id: '001', title: 'Gravel bar survey sketch: low water', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Pencil sketch of gravel bar configuration at late-summer minimum, with ford depth notations.' },
  { location_id: '001', title: 'Drainage system map: confluence and lower wetland', type: 'map / survey', period: 'early 20th century', arena_url: null, description: 'Hand-drawn map showing confluence zone, tributary angles, and extent of downstream wetland.' },
  { location_id: '001', title: 'Crossing conditions calendar', type: 'administrative record', period: 'undated', arena_url: null, description: 'Seasonal notation of when ford is passable, when ice can bear weight, and spring flood window.' },
  { location_id: '001', title: 'Phenology record: ice-in and ice-out dates', type: 'observation record', period: 'multi-year, undated', arena_url: null, description: 'Annual record of first ice formation and last ice date at confluence, both channels noted separately.' },
  { location_id: '001', title: 'Topographic survey excerpt: lower confluence terrain', type: 'map / survey', period: 'mid-20th century', arena_url: null, description: 'Cropped section of a larger topographic survey showing the flat alluvial zone and tributary junction.' },
  { location_id: '001', title: 'Cold-air pooling temperature notes: autumn', type: 'observation record', period: 'undated', arena_url: null, description: 'Handwritten temperature comparisons: meadow vs. slope above, taken at dawn over several autumn mornings.' },
  { location_id: '001', title: 'Winter wildlife track documentation', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photographs of track sequences on snow-covered meadow, showing convergence from three corridor directions.' },
  { location_id: '001', title: 'Wet meadow vegetation survey', type: 'inventory / log', period: 'undated', arena_url: null, description: 'Species list for flood-maintained wet meadow, with notes on old channel depression community.' },
  { location_id: '001', title: 'Flood debris line photograph', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph of post-flood debris deposited at meadow margin, with rough high-water elevation notation.' },
  { location_id: '001', title: 'Eastern tributary response notes: post-rain', type: 'observation record', period: 'undated', arena_url: null, description: 'Field notes comparing how quickly eastern tributary rises after rainfall versus main channel.' },
  { location_id: '001', title: 'Fog occurrence log: confluence autumn mornings', type: 'observation record', period: 'undated', arena_url: null, description: 'Notebook page logging fog presence, density, and duration on autumn mornings at confluence.' },
  { location_id: '001', title: 'Survey stake inventory and coordinate notation', type: 'administrative record', period: 'late 20th century', arena_url: null, description: 'Typed list of boundary stakes with coordinate notes and condition assessment.' },

  // ── 002 Abandoned Hillside Orchard ──────────────────────────────────────
  { location_id: '002', title: 'Orchard management map', type: 'map / sketch', period: 'early-to-mid 20th century', arena_url: 'https://www.are.na/block/46572759', description: null },
  { location_id: '002', title: 'Stenciled apple crate', type: 'photograph', period: 'early-to-mid 20th century', arena_url: 'https://www.are.na/block/46572654', description: null },
  { location_id: '002', title: 'Landscape print: 1924', type: 'print / illustration', period: '1924', arena_url: 'https://www.are.na/block/46557624', description: null },
  { location_id: '002', title: 'Harvest tally sheets: row-by-row counts', type: 'administrative record', period: 'early 20th century', arena_url: null, description: 'Handwritten harvest tally sheets listing each tree row, bushels counted, and remarks on condition.' },
  { location_id: '002', title: 'Spray schedule: typed, seasonal', type: 'administrative record', period: 'mid-20th century', arena_url: null, description: 'Typed spray application schedule listing material, dilution, and dates for each seasonal pass.' },
  { location_id: '002', title: 'Pruning notes: tree condition observations', type: 'field notes', period: 'undated', arena_url: null, description: 'Handwritten notes on individual tree pruning decisions; notes on dead limbs, graft condition, shape.' },
  { location_id: '002', title: 'Grafting diagram: variety layout', type: 'map / sketch', period: 'early 20th century', arena_url: null, description: 'Hand-drawn diagram showing which variety was grafted to which rootstock position in the orchard.' },
  { location_id: '002', title: 'Row numbering system: pencil sketch', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Schematic pencil sketch of orchard showing numbered rows and spacing, with margin annotations.' },
  { location_id: '002', title: 'Apple variety list: handwritten inventory', type: 'inventory / log', period: 'early 20th century', arena_url: null, description: 'Handwritten list of apple varieties present, with brief notes on production and hardiness.' },
  { location_id: '002', title: 'Browse line measurement record', type: 'measurement log', period: 'late 20th century', arena_url: null, description: 'Seasonal height measurements of browse line on orchard trees, year-over-year comparison.' },
  { location_id: '002', title: 'Phenology log: blossom dates and frost records', type: 'observation record', period: 'multi-year, undated', arena_url: null, description: 'Annual log of first blossom date, last frost date, and harvest window start.' },
  { location_id: '002', title: 'Weather observation notebook: growing season', type: 'observation record', period: 'early-to-mid 20th century', arena_url: null, description: 'Daily weather notes from productive growing seasons: temperature, precipitation, frost events.' },
  { location_id: '002', title: 'Equipment maintenance log: ladders and sprayer', type: 'administrative record', period: 'mid-20th century', arena_url: null, description: 'Record of ladder and spray equipment condition, repairs made, and replacement parts sourced.' },
  { location_id: '002', title: 'Bench seep output notation', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on seep flow above clearing: spring volume vs. late-summer minimum, and dry-year comparison.' },
  { location_id: '002', title: 'Succession margin advance measurements', type: 'measurement log', period: 'late 20th century', arena_url: null, description: 'Distances from known reference points to advancing pioneer shrub and birch margins, over several years.' },
  { location_id: '002', title: 'Drainage cut profile sketch', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Cross-section sketch of the upslope drainage cut above orchard clearing, showing current condition.' },
  { location_id: '002', title: 'Orchard photograph: blossom period', type: 'photograph', period: 'early 20th century', arena_url: null, description: 'Photograph of orchard clearing during blossom period; pale bloom visible against adjacent canopy.' },
  { location_id: '002', title: 'Orchard photograph: autumn fruit accumulation', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph of fallen fruit accumulated on clearing floor in October; browse disturbance visible at margin.' },
  { location_id: '002', title: 'Fog below orchard: valley fog documentation', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph taken from orchard clearing looking downslope into valley fog filling lower corridor.' },
  { location_id: '002', title: 'Cider production notes', type: 'administrative record', period: 'early 20th century', arena_url: null, description: 'Handwritten notes on cider production quantities; apple source and yield from particular rows noted.' },
  { location_id: '002', title: 'Property boundary document: bench parcel', type: 'administrative record', period: 'early 20th century', arena_url: null, description: 'Fragment of boundary description document for the bench parcel; metes and bounds language.' },
  { location_id: '002', title: 'Winter orchard snow structure photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of clearing in winter; snow defines orchard spacing against surrounding unorganized forest.' },

  // ── 003 Forest Crossing ──────────────────────────────────────────────────
  { location_id: '003', title: 'Field notes', type: 'field notes', period: 'undated', arena_url: 'https://www.are.na/block/46571401', description: null },
  { location_id: '003', title: 'Stream stage measurement log: crossing point', type: 'measurement log', period: 'undated', arena_url: null, description: 'Seasonal water level readings at crossing; notes on stone submersion depth at different flow states.' },
  { location_id: '003', title: 'Stone footing maintenance record', type: 'administrative record', period: 'undated', arena_url: null, description: 'Notes on stone placement and adjustment; the gap between second and third stone noted with no action taken.' },
  { location_id: '003', title: 'Route map excerpt: western bench traverse', type: 'map / sketch', period: 'early 20th century', arena_url: null, description: 'Cropped section of a larger route map showing crossing location in context of bench traverse network.' },
  { location_id: '003', title: 'Seasonal access log: spring closure and re-opening', type: 'observation record', period: 'undated', arena_url: null, description: 'Annual notes on when spring flood makes crossing impassable and when stones re-emerge.' },
  { location_id: '003', title: 'Blaze inventory: marked trees along approach', type: 'inventory / log', period: 'undated', arena_url: null, description: 'Record of blazed trees on approach routes to crossing; includes the healed cut on downstream spruce.' },
  { location_id: '003', title: 'Bank reinforcement notes', type: 'administrative record', period: 'undated', arena_url: null, description: 'Notes on upstream bank step; timber placement, slumping repairs, current condition.' },
  { location_id: '003', title: 'Crossing in spring flood: photograph', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph of crossing at high spring water; stepping stones at surface or submerged; saturated flat visible.' },
  { location_id: '003', title: 'Stepping stones at late-summer low water: photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph showing full stone footing exposed; mossy upper surfaces; gap between stones visible.' },
  { location_id: '003', title: 'Ice glaze crossing note: midwinter', type: 'observation record', period: 'undated', arena_url: null, description: 'Note on ice lens formation in bank face seep points; step glazing; crossing conditions in sustained cold.' },
  { location_id: '003', title: 'Autumn track record: soft flat above crossing', type: 'observation record', period: 'undated', arena_url: null, description: 'Description of track impressions in soft organic flat after dry late summer; multiple species.' },
  { location_id: '003', title: 'Timber resource survey excerpt: ravine character', type: 'technical document', period: 'early 20th century', arena_url: null, description: 'Excerpt from a timber or land survey noting the ravine character of western slope tributary crossings.' },
  { location_id: '003', title: 'Post-rain drip persistence note', type: 'observation record', period: 'undated', arena_url: null, description: 'Field note on how long drip continues in ravine head after rain has stopped; duration compared to open slope.' },
  { location_id: '003', title: 'Distance and bearing notation: crossing as route marker', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Small card with compass bearing from crossing to primary habitation zone and to ridge traverse junction.' },

  // ── 004 Beaver Meadow ───────────────────────────────────────────────────
  { location_id: '004', title: 'Landscape print: 1924', type: 'print / illustration', period: '1924', arena_url: 'https://www.are.na/northing-land/004-beaver-meadow', description: null },
  { location_id: '004', title: 'Water level stake readings: seasonal log', type: 'measurement log', period: 'late 20th century', arena_url: null, description: 'Multi-year log of water level readings taken against the marked stake at pond margin; low-water minima noted.' },
  { location_id: '004', title: 'Dam structure inspection notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Condition assessments of dam surface: new additions, erosion at downstream face, scour zone depth.' },
  { location_id: '004', title: 'Standing dead timber inventory', type: 'inventory / log', period: 'late 20th century', arena_url: null, description: 'Species, estimated height, and condition of standing dead timber visible from dam; repeated across visits.' },
  { location_id: '004', title: 'Aerial photograph comparison: eastern drainage', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Two aerial photographs of eastern drainage, different years, showing impoundment extent change.' },
  { location_id: '004', title: 'Phenology log: ice-on and ice-out comparison', type: 'measurement log', period: 'undated', arena_url: null, description: 'Annual record comparing pond freeze date vs. tributary freeze date; pond consistently earlier noted.' },
  { location_id: '004', title: 'Dam crossing track record: approach trails', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on trail convergence at dam from both pond margins; species identified from track types.' },
  { location_id: '004', title: 'Hydrological study excerpt: eastern drainage impoundment', type: 'technical document', period: 'mid-to-late 20th century', arena_url: null, description: 'Excerpt from a regional hydrological study noting the beaver impoundment and downstream flow modification.' },
  { location_id: '004', title: 'Emergent vegetation zone mapping', type: 'map / sketch', period: 'late 20th century', arena_url: null, description: 'Sketch plan of pond showing emergent sedge margin, shrub colonization zone, and standing dead positions.' },
  { location_id: '004', title: 'Pond surface fog observation notes: autumn', type: 'observation record', period: 'undated', arena_url: null, description: 'Field notes on shallow surface fog at pond; onset conditions, height, and dissipation rate compared to valley fog.' },
  { location_id: '004', title: 'Water clarity log: seasonal turbidity', type: 'measurement log', period: 'undated', arena_url: null, description: 'Seasonal observations on pond water clarity; spring turbid, autumn clear; notes on sediment behavior near source.' },
  { location_id: '004', title: 'Passage record: seasonal crossing conditions at dam', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on seasonal passability of dam crossing: footing condition, water above dam in spring, ice in winter.' },
  { location_id: '004', title: 'Canal extent sketch: lateral drainage', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Pencil sketch showing canal channels extending from pond margin into formerly dry valley-floor terrain.' },
  { location_id: '004', title: 'Standing dead in fog: photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of standing dead timber emerging through shallow autumn fog above pond surface.' },
  { location_id: '004', title: 'Spring ice breakup: pond vs. channel', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph showing fractured pond ice and open tributary channel below dam; transitional ice state.' },
  { location_id: '004', title: 'Low-water margin exposure: autumn photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of former ground surface exposed at autumn low water; former valley floor briefly legible.' },
  { location_id: '004', title: 'Downstream channel modification assessment', type: 'technical document', period: 'undated', arena_url: null, description: 'Notes on how dam-regulated release modifies downstream tributary character; episodic pulse events documented.' },
  { location_id: '004', title: 'Sediment accumulation notation', type: 'observation record', period: 'undated', arena_url: null, description: 'Field notes comparing apparent bottom depth at fixed probing points across years; slow shoaling noted.' },

  // ── 005 Stone Foundation Clearing ───────────────────────────────────────
  { location_id: '005', title: 'Architectural plans: 1898', type: 'plan / drawing', period: '1898', arena_url: 'https://www.are.na/block/46572622', description: null },
  { location_id: '005', title: 'Landscape print: 1924', type: 'print / illustration', period: '1924', arena_url: 'https://www.are.na/block/46557646', description: null },
  { location_id: '005', title: 'Foundation stone inventory: course measurements', type: 'inventory / log', period: 'late 20th century', arena_url: null, description: 'Field notes counting surviving stone courses; corner geometry notes; displacement observations.' },
  { location_id: '005', title: 'Depression moisture record: seasonal comparison', type: 'measurement log', period: 'undated', arena_url: null, description: 'Notes on standing water in foundation interior depression: spring pool depth vs. summer dry state.' },
  { location_id: '005', title: 'Lichen survey: colonization extent on stones', type: 'inventory / log', period: 'late 20th century', arena_url: null, description: 'Rough survey of lichen coverage on surviving stone courses; species noted; stable vs. recently displaced stones.' },
  { location_id: '005', title: 'Browse line measurement: pioneer trees in clearing', type: 'measurement log', period: 'late 20th century', arena_url: null, description: 'Heights of browse suppression on pioneer birch and aspen in clearing interior and at margin; year-over-year.' },
  { location_id: '005', title: 'Winter track record: snow surface documentation', type: 'observation record', period: 'undated', arena_url: null, description: 'Detailed notes on tracks in snow at clearing and foundation rubble; approach routes from traverse noted.' },
  { location_id: '005', title: 'Clearing vegetation survey', type: 'inventory / log', period: 'late 20th century', arena_url: null, description: 'Species list for clearing interior vs. surrounding bench forest; altered-soil indicator species noted.' },
  { location_id: '005', title: 'Pioneer tree recruitment record', type: 'inventory / log', period: 'late 20th century', arena_url: null, description: 'Species, estimated age, and location of pioneer trees established since abandonment; margin vs. interior.' },
  { location_id: '005', title: 'Drainage cut section sketch', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Cross-section sketch of drainage cut above clearing; current condition, vegetation encroachment noted.' },
  { location_id: '005', title: 'Property assessment or deed fragment', type: 'administrative record', period: 'late 19th century', arena_url: null, description: 'Partial document with property description language for bench parcel; metes and bounds; partial only.' },
  { location_id: '005', title: 'Material inventory: stone and construction notes', type: 'inventory / log', period: 'late 19th century', arena_url: null, description: 'Handwritten inventory of building materials: stone type, rough dimensions, no mortar noted.' },
  { location_id: '005', title: 'Clearing in spring before leaf-out: photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of clearing in early spring; foundation remnants legible before vegetation returns.' },
  { location_id: '005', title: 'Clearing in winter: snow surface geometry photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of clearing after moderate snowfall; former footprint geometry readable in snow surface.' },
  { location_id: '005', title: 'Path condition note: bench traverse approach', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on approach trail condition: worn surface, vegetation compression, legibility against surrounding slope.' },
  { location_id: '005', title: 'Disturbance history note: comparing visits', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes from a return visit comparing current stone positions and succession margin to prior visit observations.' },
  { location_id: '005', title: 'Archaeological surface survey notes', type: 'technical document', period: 'late 20th century', arena_url: null, description: 'Brief notes from a surface examination of clearing; artifacts noted (none removed); stone course count.' },
  { location_id: '005', title: 'Occupant-era work record fragment', type: 'administrative record', period: 'late 19th to early 20th century', arena_url: null, description: 'Partial document — likely a supply or labor record — associated with the clearing\'s period of occupation.' },

  // ── 006 Headwater Spring ─────────────────────────────────────────────────
  { location_id: '006', title: 'Field notes', type: 'field notes', period: 'undated', arena_url: 'https://www.are.na/block/46571353', description: null },
  { location_id: '006', title: 'Discharge measurement log: seasonal flow rates', type: 'measurement log', period: 'undated', arena_url: null, description: 'Tabular log of spring discharge estimates across seasons; notes on late-summer minimum and spring peak.' },
  { location_id: '006', title: 'Ice formation record: autumn onset to spring last', type: 'measurement log', period: 'undated', arena_url: null, description: 'Annual record of first ice appearance, winter maximum extent, and last ice date at emergence zone.' },
  { location_id: '006', title: 'Water temperature log: seasonal measurements', type: 'measurement log', period: 'undated', arena_url: null, description: 'Spot measurements of spring temperature across seasons; notes on cold zone above pool in summer.' },
  { location_id: '006', title: 'Sediment turbidity observation notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on sediment cycling: clear in low-flow periods, briefly turbid after flow increases; settling time.' },
  { location_id: '006', title: 'Spring-to-stream sketch: first channel thread', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Sketch of the first meters of flow from emergence point to where the thread finds a defined grade.' },
  { location_id: '006', title: 'Vegetation inventory: spring community species', type: 'inventory / log', period: 'undated', arena_url: null, description: 'Species list for the spring emergence zone: sphagnum, horsetail, wet-ground forbs vs. adjacent bench forest.' },
  { location_id: '006', title: 'Wildlife track documentation: approach trail and wet zone', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on track impressions in wet substrate near spring; approach trail from bench traverse described.' },
  { location_id: '006', title: 'Bench seep comparison notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes comparing this spring\'s persistence through drought to nearby bench seeps that dried; source distinction.' },
  { location_id: '006', title: 'Dark spot in snowpack: late winter photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of late-winter snowfield showing dark oval of upwelling wet ground; snow otherwise unbroken.' },
  { location_id: '006', title: 'Ice formation at emergence: photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph of ice dome structure built up at spring emergence through successive winter nights.' },
  { location_id: '006', title: 'Groundwater level interpretation notes', type: 'technical document', period: 'mid-20th century', arena_url: null, description: 'Brief technical notes interpreting spring discharge as indicator of till reservoir condition across watershed.' },
  { location_id: '006', title: 'Adjacent seep comparison: slope distribution notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes locating and describing other bench seep positions for comparison; this spring\'s persistence distinguished.' },
  { location_id: '006', title: 'Seasonal arrival record: first new growth at spring', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on first green emergence at spring zone compared to surrounding bench forest; temporal lead noted.' },
  { location_id: '006', title: 'Survey marker note: bench position reference', type: 'administrative record', period: 'undated', arena_url: null, description: 'Brief notation of spring location as bench position reference in a traverse survey.' },
  { location_id: '006', title: 'Path wear record: approach from bench traverse', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on path condition from traverse to spring margin; wear evidence indicating repeated use.' },

  // ── 007 Ridge Overlook ───────────────────────────────────────────────────
  { location_id: '007', title: 'Landscape print: 1924', type: 'print / illustration', period: '1924', arena_url: 'https://www.are.na/block/46557635', description: null },
  { location_id: '007', title: 'Weather observation log: temperature, pressure, wind, cloud', type: 'observation record', period: 'multi-year, undated', arena_url: null, description: 'Multi-column weather log kept at ridge position; columns for temperature, cloud type, wind direction and force, barometer.' },
  { location_id: '007', title: 'Visibility record: long-range sightlines', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on visibility range under different atmospheric conditions; named structural features checked off by legibility.' },
  { location_id: '007', title: 'Fog ceiling height log: autumn mornings', type: 'measurement log', period: 'undated', arena_url: null, description: 'Estimated fog ceiling height in autumn; compared to interior ridge profile to assess inversion depth.' },
  { location_id: '007', title: 'Barometric pressure record: weather event correlations', type: 'measurement log', period: 'undated', arena_url: null, description: 'Pressure readings at ridge with subsequent weather noted; pattern recognition over multiple seasons.' },
  { location_id: '007', title: 'Wind direction frequency record: seasonal summary', type: 'measurement log', period: 'undated', arena_url: null, description: 'Tally of wind directions at ridge position; winter northwest dominance vs. summer southwest noted.' },
  { location_id: '007', title: 'Cloud type identification notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Handwritten notes on cloud identification from ridge; approach weather systems characterized by cloud type.' },
  { location_id: '007', title: 'Incoming weather approach: southwest horizon notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on reading incoming weather from southwest horizon before valley feels any change; lead time estimated.' },
  { location_id: '007', title: 'Valley fog from above: photograph', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph looking down from ridge into valley fog layer; interior ridge line projects above white surface.' },
  { location_id: '007', title: 'Clearing event sequence: atmospheric photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Photograph taken during post-frontal clearing: ridge in sunlight, valley still in cloud, transition zone moving down.' },
  { location_id: '007', title: 'Snow depth record at ridge', type: 'measurement log', period: 'undated', arena_url: null, description: 'Seasonal snow depth at ridge bedrock vs. adjacent krummholz mat; wind scour effect documented.' },
  { location_id: '007', title: 'First and last snow date across years', type: 'measurement log', period: 'multi-year, undated', arena_url: null, description: 'Annual record of first snow at ridge vs. first snow at valley floor; ridge consistently first and last.' },
  { location_id: '007', title: 'Shelter maintenance log', type: 'administrative record', period: 'undated', arena_url: null, description: 'Brief maintenance notes for ridge shelter: repairs made, condition of anchoring, weathering observations.' },
  { location_id: '007', title: 'Ridge approach condition notes: seasonal accessibility', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on when krummholz approach is passable; ice glaze conditions, deep-winter inaccessibility periods.' },
  { location_id: '007', title: 'Structural watershed sketch: drainage reading from overlook', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Annotated sketch of the watershed as seen from ridge; tonal features identified, valley direction noted.' },
  { location_id: '007', title: 'Sunrise and sunset timing record: seasonal', type: 'measurement log', period: 'undated', arena_url: null, description: 'Seasonal sunrise/sunset times recorded from ridge position; horizon obstruction by adjacent high point noted.' },
  { location_id: '007', title: 'Interior ridge above fog: photograph', type: 'photograph', period: 'mid-20th century', arena_url: null, description: 'Photograph showing interior secondary ridge projecting above valley fog layer; eastern drainage fog-free.' },
  { location_id: '007', title: 'Orientation diagram: watershed features as seen from ridge', type: 'map / sketch', period: 'undated', arena_url: null, description: 'Hand-drawn panoramic diagram annotating tonal features visible from ridge: valley band, interior ridge, lower wetland.' },
  { location_id: '007', title: 'Winter visibility conditions: post-frontal clarity notes', type: 'observation record', period: 'undated', arena_url: null, description: 'Notes on exceptional winter visibility after cold-front passage; named structural features legible.' },

  // ── COLOR / PERSONAL LAYER ────────────────────────────────────────────────
  // 001 Tributary Confluence Wet Meadow
  { location_id: '001', title: 'Wildflower study: wet meadow species', type: 'naturalist notebook', period: 'early 20th century', arena_url: null, description: 'Watercolor studies of five wet-meadow forbs; each plant shown in flower with a pressed specimen alongside. Painted in the field; color notes written in margin where pigment ran short.' },
  { location_id: '001', title: 'Color slide: spring flood at confluence', type: 'color slide', period: '1950s', arena_url: null, description: 'Kodachrome slide showing the confluence at spring flood peak; brown water carrying ice fragments, far bank submerged to lower branches. Sky a pale cold blue.' },
  { location_id: '001', title: 'Polaroid: autumn sedge margin', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Faded Polaroid of the sedge margin in October; warm amber against standing water reflecting a grey sky. Print slightly overexposed at center.' },
  { location_id: '001', title: 'Nature journal page: frogs and herons', type: 'nature journal', period: 'undated', arena_url: null, description: "Child's journal page with pencil sketches of a green frog and a great blue heron, labeled in careful printing. A pressed cattail leaf taped to the bottom edge, now dried flat and pale." },
  { location_id: '001', title: 'Postcard: confluence valley view', type: 'postcard', period: 'early 20th century', arena_url: null, description: 'Printed postcard showing the valley corridor from an elevated vantage; colors hand-tinted, sky lavender-blue, meadow a saturated green. No message on reverse.' },

  // 002 Abandoned Hillside Orchard
  { location_id: '002', title: 'Seed catalog page: apple varieties', type: 'seed catalog page', period: 'early 20th century', arena_url: null, description: "Single page from a regional nursery catalog showing six apple varieties in color illustration: McIntosh, Northern Spy, Wealthy, and three now-obscure names. Colors slightly garish; the Wealthy is a deep arterial red." },
  { location_id: '002', title: 'Harvest ribbon: county fair, apple class', type: 'harvest ribbon', period: 'mid-20th century', arena_url: null, description: 'Second-place ribbon in deep blue and gold; printed with county name and year. Attached by a small pin that has left a rust mark on the fabric. Apple class lettered in gilt.' },
  { location_id: '002', title: 'Painted crate label: variety name and orchard', type: 'crate label', period: 'early-to-mid 20th century', arena_url: null, description: 'Color-printed paper crate label with orchard name in bold serif type; apple illustration in red and green against a cream field. A faint blue border, slightly misregistered at one corner.' },
  { location_id: '002', title: 'Color slide: orchard at full blossom', type: 'color slide', period: '1950s', arena_url: null, description: 'Kodachrome slide of the orchard clearing at peak blossom; white and pale pink bloom against the dark spruce wall at the clearing edge. Sky an oversaturated Kodachrome blue.' },
  { location_id: '002', title: 'Orchard variety chart: hand-colored', type: 'orchard variety chart', period: 'early 20th century', arena_url: null, description: 'Hand-drawn grid showing each row, variety, and rootstock; variety names written in ink, each column headed with a small watercolor patch in approximate fruit color. Annotations added over multiple seasons in different hands.' },
  { location_id: '002', title: 'Feed store advertisement: orchard spraying equipment', type: 'advertisement', period: 'mid-20th century', arena_url: null, description: 'Printed broadsheet advertising a regional feed and farm supply store; orchard spray rigs illustrated in line engraving. A handwritten note in the margin: "ask about the 40-gal."' },
  { location_id: '002', title: 'Color slide: fruit accumulation on clearing floor', type: 'color slide', period: '1960s', arena_url: null, description: 'Slide showing windfallen apples covering the clearing floor in October; red and yellow against dark earth, some already browning. A deer track visible in the lower right corner.' },

  // 003 Forest Crossing
  { location_id: '003', title: 'Mushroom sketches: forest floor species', type: 'naturalist notebook', period: 'undated', arena_url: null, description: 'Notebook page with watercolor sketches of four mushroom species found near the crossing; one identified by common name only, one with a question mark. Spore print glued alongside, rust-brown on white paper.' },
  { location_id: '003', title: 'Color slide: crossing in peak autumn', type: 'color slide', period: '1960s', arena_url: null, description: 'Kodachrome slide of the stone crossing in mid-October; yellow birch leaves banked against the upstream stones, water black in shadow. The flat above crossing visible and bright.' },
  { location_id: '003', title: 'Camp pennant: watershed trail organization', type: 'camp pennant', period: 'mid-20th century', arena_url: null, description: 'Wool felt pennant in dark green with cream lettering; organization name and a stylized pine tree. Slightly moth-damaged at one edge. The kind issued for trail membership or canoe route completion.' },
  { location_id: '003', title: 'Painted trail marker: close-up photograph', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Close-up photograph of a blaze on a birch trunk near the crossing approach; paint orange, applied in two coats, lower coat older and greyed. Bark has grown slightly around the older mark.' },

  // 004 Beaver Meadow
  { location_id: '004', title: 'Bird migration chart: waterfowl, eastern flyway', type: 'migration chart', period: 'mid-20th century', arena_url: null, description: 'Hand-colored chart showing migration timing for nine waterfowl species; arrival and departure bars filled in watercolor by species. Duck silhouettes printed in black; color added in pencil and wash over multiple seasons.' },
  { location_id: '004', title: 'Color slide: waterfowl on open pond', type: 'color slide', period: '1950s–60s', arena_url: null, description: 'Kodachrome slide of the pond in early May; a small group of ring-necked ducks on the water surface, standing dead behind them silver-white. Ice remnant at far margin.' },
  { location_id: '004', title: 'Insect collection card: dragonfly species', type: 'insect collection', period: 'late 20th century', arena_url: null, description: 'Mounting card with three pinned dragonfly specimens from the pond margin; species labels in small type below each. Wings intact and iridescent; one specimen slightly faded to amber.' },
  { location_id: '004', title: 'Color snapshot: autumn colors at pond', type: 'photograph', period: '1970s', arena_url: null, description: 'Early color snapshot — slightly warm-shifted with age — showing the pond in mid-October; tamarack yellow and red maple reflected in still water. A handwritten date on the back.' },
  { location_id: '004', title: 'Pressed sedge specimen: emergent species', type: 'naturalist notebook', period: 'undated', arena_url: null, description: 'Pressed and mounted sedge from the pond margin, glued to a notebook page with a penciled identification note. Stem flat and pale, seed head still intact.' },

  // 005 Stone Foundation Clearing
  { location_id: '005', title: 'Watercolor geological section: bench stratigraphy', type: 'geological section', period: 'mid-20th century', arena_url: null, description: 'Hand-drawn cross-section of the western bench stratigraphy; layers colored in watercolor wash — buff for till, grey-brown for organic layer, pale yellow for sand lens. Prepared for a regional survey; field notations in pencil below the finished color.' },
  { location_id: '005', title: "Child's handmade map: clearing and surrounding forest", type: 'handmade map', period: 'undated', arena_url: null, description: "Hand-drawn on ruled notebook paper in pencil and crayon; the stone foundation labeled 'old house,' the trail in red, the forest in green scribble. A north arrow pointing roughly northeast. Distances labeled in minutes of walking." },
  { location_id: '005', title: 'Pressed flower collection: clearing species', type: 'pressed flower collection', period: 'late 19th to early 20th century', arena_url: null, description: 'Small envelope containing four pressed flowers from the clearing interior; goldenrod, a hawkweed, something in the aster family. Colors faded to cream and pale ochre. No labels, but the envelope is initialed.' },
  { location_id: '005', title: 'Color slide: clearing at peak autumn color', type: 'color slide', period: '1950s', arena_url: null, description: 'Kodachrome slide of the clearing in October; pioneer birch and aspen in full yellow, foundation stone grey beneath. The contrast between the lit clearing and the dark spruce margin is pronounced in the slide.' },

  // 006 Headwater Spring
  { location_id: '006', title: 'Naturalist notebook: spring wildflowers', type: 'naturalist notebook', period: 'early 20th century', arena_url: null, description: 'Two notebook pages of watercolor field sketches: marsh marigold in vivid yellow, blue violet, early trout lily. Each plant labeled in a neat hand; color applied quickly, still wet when the page was turned — faint ghost print on facing page.' },
  { location_id: '006', title: 'Vegetation community diagram: spring zone', type: 'vegetation diagram', period: 'mid-20th century', arena_url: null, description: 'Hand-colored diagram showing plant community zones radiating from the spring emergence point; each zone labeled and colored in watercolor wash. Sphagnum in pale green, horsetail in grey-green, upland transition in buff.' },
  { location_id: '006', title: 'Color slide: spring zone in early June', type: 'color slide', period: '1960s', arena_url: null, description: 'Kodachrome slide of the spring emergence zone at peak early-summer color; marsh marigold still in flower at margin, new growth vivid against the still-bare mineral soil around the pool.' },
  { location_id: '006', title: 'Polaroid: spring emergence pool', type: 'photograph', period: 'late 20th century', arena_url: null, description: 'Polaroid of the emergence pool in summer; water surface clear, sandy upwelling point visible at bottom. Print slightly warm-shifted. The scale of the pool is difficult to read without context.' },

  // 007 Ridge Overlook
  { location_id: '007', title: 'Hand-colored survey map: watershed overview', type: 'hand-colored map', period: 'early 20th century', arena_url: null, description: 'Printed survey base map with hand-applied color washes; watershed boundary in red, drainage network in blue ink, forest cover in a pale green wash that has faded unevenly. Elevation contours in printed black.' },
  { location_id: '007', title: 'Color slide: autumn valley from ridge', type: 'color slide', period: '1950s', arena_url: null, description: 'Kodachrome slide taken from the overlook looking down the valley corridor in full autumn color; the deciduous band through the valley floor orange and red, surrounding slopes darker. Sky overexposed.' },
  { location_id: '007', title: 'Local fair program: watershed community', type: 'fair program', period: 'mid-20th century', arena_url: null, description: 'Folded paper program for an annual local fair; schedule of events includes agricultural classes, pie judging, and a "nature walk" entry. Printed in two colors — black and a dark red. One page detached.' },
  { location_id: '007', title: 'Watercolor sketch: ridge view with cloud shadow', type: 'naturalist notebook', period: 'undated', arena_url: null, description: 'Small watercolor sketch made from the overlook; valley rendered in loose washes of grey-green and ochre, a cloud shadow crossing the middle distance in blue-grey. The ridge foreground left unpainted — white paper.' },
  { location_id: '007', title: 'Bird migration chart: ridge hawk count', type: 'migration chart', period: 'mid-20th century', arena_url: null, description: 'Hand-colored chart recording daily hawk counts at the ridge over six autumn seasons; broad-winged hawk peak marked with a vertical red line. Columns for species, wind direction, temperature. A good day circled in pencil.' },

  // ── PHOTOGRAPHED COLLECTIONS / CHILD'S PERSPECTIVE / TOOLS / SENSORY ────
  // 001 Tributary Confluence Wet Meadow
  { location_id: '001', title: 'Sound map: confluence on a June morning', type: 'sound map', period: 'undated', arena_url: null, description: 'Hand-drawn plan of the confluence area annotated with directional sound sources: frog chorus bearing south, water arriving audibly from two different directions, red-winged blackbird from the alder margin. A note reads "eastern tributary louder this morning — rain two days ago." Compass rose in pencil at center.' },
  { location_id: '001', title: 'Catch log: spring run at confluence', type: 'catch log', period: 'mid-20th century', arena_url: null, description: 'Small spiral notebook recording fishing outings at the confluence. Columns: date, species, length, condition, kept or released. Some dates are crossed out with no entry and no explanation. The last dated page has a single fish recorded and no further pages filled.' },
  { location_id: '001', title: 'Trapping record: mink and muskrat sets', type: 'trapping record', period: 'mid-20th century', arena_url: null, description: 'Pocket notebook listing trap set locations by number, species caught, date, and pelt condition. Inside front cover: a rough sketch map of the meadow with numbered trap positions in pencil. A note beside one set: "flooded out — moved to bank edge."' },
  { location_id: '001', title: 'Child\'s nature report: the frog pond', type: 'schoolchild nature project', period: 'undated', arena_url: null, description: 'Three handwritten pages in careful printing recording observations at the wet meadow over a summer. Opening line: "I watched the frog pond six times." Pencil drawings of tadpoles and a great blue heron, labeled by name. Teacher comments in red at the margin: "very good observation." A grass stain across the back page.' },
  { location_id: '001', title: 'Photo series: confluence bank, four seasons', type: 'photo series', period: 'late 20th century', arena_url: null, description: 'Four photographs taken from the same marked position on the east bank: spring flood, summer sedge, autumn color, winter ice. The marker stake is visible in three of the four frames. Season and year written in the same hand on the back of each print.' },

  // 002 Abandoned Hillside Orchard
  { location_id: '002', title: 'Tool shed inventory: ladders, sprayer, and implements', type: 'tool inventory', period: 'mid-20th century', arena_url: null, description: 'Two handwritten pages listing the orchard shed contents: four ladders by length and condition, two spray tanks with capacities, pruning saws, picking hooks, a hand-cart noted as "wheel split — not replaced." Items struck through as lost or discarded; the list appears to have been amended across at least three seasons in different pencil densities.' },
  { location_id: '002', title: 'Recipe card: apple butter, orchard batch', type: 'recipe card', period: 'mid-20th century', arena_url: null, description: 'Index card in faded blue ink: apple quantity, cider, spices, yield in quarts. A margin note reads "use the Wealthys, not the Spies." A penciled asterisk next to the reduction step with no accompanying explanation. Some spattering on the lower edge consistent with use near a heat source.' },
  { location_id: '002', title: 'Child\'s drawing: the orchard in blossom', type: 'child\'s drawing', period: 'undated', arena_url: null, description: 'Crayon on ruled school paper. Trees in white and pale pink against a blue sky; one tree labeled "the biggest one." A small figure with a ladder stands at the far margin. The figure has been erased and redrawn at least once — the ghost of the first attempt still visible below the crayon.' },
  { location_id: '002', title: 'Tin label: preserved apple, orchard name', type: 'tin label', period: 'early 20th century', arena_url: null, description: 'Paper label removed from a preserved-fruit tin: orchard name in bold type, variety and pack year below. A small apple in line engraving. Water damage at one corner has blurred the pack year to near-illegibility. Edges torn unevenly where the label was peeled from the tin.' },
  { location_id: '002', title: 'Rubbing: stone wall inscription', type: 'rubbing', period: 'undated', arena_url: null, description: 'Pencil rubbing on thin drafting paper taken from an inscription on the orchard boundary wall. A set of initials and what may be a year; partially legible, the stone surface texture transferring clearly around the carved lines. Mounted on backing paper with a brief annotation: "south wall, third panel."' },

  // 003 Forest Crossing
  { location_id: '003', title: 'Leaf rubbing collection: approach corridor', type: 'leaf rubbing collection', period: 'undated', arena_url: null, description: 'Notebook of pencil rubbings gathered on the approach to the crossing: yellow birch, striped maple, hobblebush, and one labeled with a question mark. Colors have faded to grey but vein structure is distinct. The last page has a fern pressed alongside, dried flat and pale, held by a strip of tape that has yellowed.' },
  { location_id: '003', title: 'Growth ring count: felled spruce near crossing', type: 'growth ring count', period: 'late 20th century', arena_url: null, description: 'Handwritten notes from counting rings on a spruce stump near the crossing: total rings, estimated year of germination, and a note on a compressed decade — narrow rings, no explanation offered. A pencil diagram of the stump cross-section shows the ring asymmetry: one side significantly wider than the other.' },
  { location_id: '003', title: 'Stone collection: nine from the crossing', type: 'child\'s collection', period: 'undated', arena_url: null, description: 'A small cloth bag containing nine smooth stones selected from the stepping stones. Each labeled with a strip of paper tied with thread, numbered 1 through 9. A handwritten list names each: "flat grey," "the orange one," "the egg," "blue if wet," "heavy one." The bag is initialed on the inside seam.' },
  { location_id: '003', title: 'Photo series: same view at the crossing, four seasons', type: 'photo series', period: 'late 20th century', arena_url: null, description: 'Four photographs taken from a marked position above the stepping stones, one per season. Stones fully exposed in late summer, submerged in spring; summer moss disappears under snow in winter. The water surface changes shape entirely between seasons. Year written on the back of each in the same hand.' },
  { location_id: '003', title: 'Mending record: pack trip gear across seasons', type: 'mending record', period: 'undated', arena_url: null, description: 'Small notebook tracking repairs to gear used on approaches through the crossing corridor: wool socks (right heel repaired three times, left heel once), a pack strap, a canvas waterproof pouch. The last sock entry: "not worth it again." A needle and a spool of thread tucked into the back cover.' },

  // 004 Beaver Meadow
  { location_id: '004', title: 'Soil sample card: pond margin core', type: 'soil sample card', period: 'mid-20th century', arena_url: null, description: 'Index card recording a hand-core taken at the pond margin: organic muck depth in centimeters, grey mineral layer below, compacted till beneath that. A note: "sulfide smell at depth." Sample position marked with a dot on a small sketch of the pond margin drawn in the card corner.' },
  { location_id: '004', title: 'Star observation log: from the beaver dam', type: 'star observation log', period: 'undated', arena_url: null, description: 'Notebook pages recording observations made while sitting on the dam at night: planet positions in two seasons, Milky Way visibility, and one note: "three meteorites, northwest to southeast, approximately 11:40pm — could not sleep." Water reflections mentioned twice as part of what was seen.' },
  { location_id: '004', title: 'Growth ring count: gnawed birch at dam margin', type: 'growth ring count', period: 'late 20th century', arena_url: null, description: 'Notes from counting rings on a beaver-felled birch stub at the dam: total rings, estimated diameter at time of felling. A margin note compares this to the smallest-diameter birch previously recorded at the site. The stub was small enough to count by eye without sectioning.' },
  { location_id: '004', title: 'Child\'s diary entry: the dam', type: 'diary excerpt', period: 'undated', arena_url: null, description: 'Two sentences in large, careful cursive on a half-page of ruled notebook paper: "Today we walked all the way to the beaver dam. I saw a red-winged blackbird and a dead tree with no bark." A date is attempted at the top but the year is smudged beyond reading.' },
  { location_id: '004', title: 'Decay documentation: same timber, four visits', type: 'decay documentation', period: 'undated', arena_url: null, description: 'Sketches and notes from four visits to the same fallen birch inside the impoundment zone; the log\'s progression from solid to soft to fragmented recorded across an estimated fifteen years. Fungi succession noted visit by visit: shelf fungi by the second visit, substrate collapsed at the fourth. The final entry estimates three more years of visible coherence.' },

  // 005 Stone Foundation Clearing
  { location_id: '005', title: 'Child\'s rubbings: foundation stone surfaces', type: 'rubbing', period: 'undated', arena_url: null, description: 'Four pencil rubbings on thin drafting paper taken from foundation stone surfaces. Lichen patterns, surface texture, and what may be a tool mark are visible on the third sheet. The fourth rubbing is smeared — paper shifted during transfer. Sheets labeled in the child\'s own shorthand: "corner," "long side," "back," "fell one."' },
  { location_id: '005', title: 'Growth ring count: pioneer birch in clearing interior', type: 'growth ring count', period: 'late 20th century', arena_url: null, description: 'Notes on counting rings in a pioneer birch that fell inside the former foundation footprint. Working backward from the count to an estimated germination year, a penciled note: "if count is right, this tree came up within 10 years of abandonment." A second hand has added in the margin: "check against deed fragment."' },
  { location_id: '005', title: 'Mineral sample card: stones from the clearing floor', type: 'mineral sample card', period: 'undated', arena_url: null, description: 'Small card with three fragments glued alongside pencil labels: red granite, pale feldspar, and flat grey shale. The shale entry notes: "doesn\'t match the foundation stone — not from here." Collected from the clearing floor surface, not from any structural course.' },
  { location_id: '005', title: 'Tool cache list: stone-setting implements', type: 'tool inventory', period: 'late 19th century', arena_url: null, description: 'Fragment of a handwritten list from the construction period: stone bars, mallets, and wedges itemized with rough counts. One entry reads "chisel — at mill." The ink has faded to brown; the lower portion of the page is torn away, leaving the list incomplete.' },
  { location_id: '005', title: 'Decay documentation: fallen interior timber, four visits', type: 'decay documentation', period: 'undated', arena_url: null, description: 'Notes and rough sketches from four return visits to the same fallen log inside the former foundation footprint. Collapse progression recorded across what appears to be twelve to fifteen years; fungi names attempted in two entries, one crossed out and corrected. The final note estimates the wood will be gone into the substrate within three more years.' },

  // 006 Headwater Spring
  { location_id: '006', title: 'Foraging notes: spring-adjacent plants', type: 'foraging notes', period: 'early 20th century', arena_url: null, description: 'Pencil notes on edible and medicinal plants found near the spring emergence zone: watercress, ostrich fern fiddleheads, horsetail with a cautionary note on quantity. A rough sketch of each. A later hand has added a question mark next to the horsetail entry with no further comment.' },
  { location_id: '006', title: 'Water taste record: seasonal notes', type: 'sensory record', period: 'undated', arena_url: null, description: 'Brief handwritten observations on the spring\'s taste across visits and years: "sharp and cold in February," "faintly of iron in June after a dry May," "clean and without character in late summer." A note at the bottom compares it favorably to a named well in the valley, which "had gone off."' },
  { location_id: '006', title: 'Child\'s watercolor: the spring pool', type: 'child\'s drawing', period: 'undated', arena_url: null, description: 'Small watercolor painted at the site. The pool in three overlapping shades of blue-green; a yellow-green fern at the margin; bare mineral soil around the emergence point left as unpainted white paper. Paint muddied at the center where too much water was used. The paper has warped from field use.' },
  { location_id: '006', title: 'Sound log: spring zone, four seasons', type: 'sound log', period: 'undated', arena_url: null, description: 'Notebook pages recording what was audible at the spring across seasons: winter drip into ice and nothing else, spring wood thrush from the bench above, summer insect constant, autumn silence broken only by movement in leaf litter. A note on the winter page: "only the drip. Nothing else for twenty minutes."' },
  { location_id: '006', title: 'Photo series: emergence zone, five years', type: 'photo series', period: 'late 20th century', arena_url: null, description: 'Five photographs taken from the same position above the pool, one each autumn. Year penciled on the back of each. Small year-on-year differences in pool margin and sphagnum extent visible on comparison; a birch sapling at the left edge grows measurably taller across the sequence.' },

  // 007 Ridge Overlook
  { location_id: '007', title: 'Star map: sky from the ridge', type: 'star map', period: 'undated', arena_url: null, description: 'Hand-drawn map on dark paper, stars marked in white pencil; constellations labeled, Milky Way indicated by a shaded arc. A circled point carries a note: "this one moved — not a star." The ridge outline is drawn along the bottom edge for orientation. A planet is noted in the margin with an estimated month.' },
  { location_id: '007', title: 'Firewood record: ridge shelter fuel across winters', type: 'firewood record', period: 'undated', arena_url: null, description: 'A pocket ledger recording fuel brought to the ridge shelter and consumed per stay: bundle counts or estimated weight, ambient temperature at arrival, overnight low. One entry: "green — poor." Another: "brought too much, left half — still there next time." The record spans eight winters.' },
  { location_id: '007', title: 'Radio reception log: ridge position vs. valley', type: 'radio log', period: 'mid-20th century', arena_url: null, description: 'Notes comparing signal quality at the ridge versus the valley floor. Stations listed with clarity ratings across seasons; a Montreal station noted as reliably clear in winter from the ridge, absent from the valley. A note: "try northwest side of shelter in summer — spruce blocks it now."' },
  { location_id: '007', title: 'Tool inventory: ridge shelter cache', type: 'tool inventory', period: 'undated', arena_url: null, description: 'A list of tools cached at the ridge shelter: a whetstone, a folding saw, two coils of spare rope, a tin of tallow, and three items listed as "missing." One entry reads "replaced — original gone." Written in at least three different hands; the list was clearly added to over years rather than recopied fresh.' },
  { location_id: '007', title: 'Sound map: ridge in high wind', type: 'sound map', period: 'undated', arena_url: null, description: 'Diagram of the ridge drawn from above, with sound sources annotated for a sustained northwest wind event: wind tone through krummholz mat (constant), ice tick on exposed bedrock (intermittent, northeast face), shelter line drumming (gusts only). A note at the bottom: "no valley sounds audible at all. Could hear my own breathing."' },
  { location_id: '007', title: 'Letter fragment: describing the view from the ridge', type: 'correspondence', period: 'early 20th century', arena_url: null, description: 'Half a page of a letter, torn across the top, no salutation surviving. The writer describes the view at length: the valley corridor, "the southern peaks which I take to be thirty miles," morning light on the opposite slope. The handwriting grows smaller toward the bottom as if a page end was approaching. No signature.' },
];

// ─── are.na utilities ─────────────────────────────────────────────────────────

function extractArenaBlockId(url) {
  if (!url) return null;
  const match = url.match(/are\.na\/block\/(\d+)/);
  return match ? match[1] : null;
}

async function fetchArenaBlock(blockId) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const response = await fetch(`https://api.are.na/v2/blocks/${blockId}`, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      title: data.title || data.generated_title || null,
      imageUrl: (data.image && (data.image.square?.url || data.image.display?.url)) || null,
      contentType: data.class || 'Block',
      content: data.content || null,
    };
  } catch {
    return null;
  }
}

// ─── Database initialization ──────────────────────────────────────────────────

const SEED_VERSION = '3';

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id SERIAL PRIMARY KEY,
      location_id VARCHAR(3) NOT NULL,
      title VARCHAR(500) NOT NULL,
      type VARCHAR(100),
      period VARCHAR(200),
      arena_url VARCHAR(500),
      arena_block_id VARCHAR(50),
      arena_image_url TEXT,
      arena_fetched BOOLEAN DEFAULT FALSE,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS app_state (
      key VARCHAR(50) PRIMARY KEY,
      value TEXT
    );
  `);

  // Ensure unique index exists so ON CONFLICT works
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS artifacts_loc_title_unique
    ON artifacts (location_id, title)
  `);

  const { rows } = await pool.query("SELECT value FROM app_state WHERE key = 'seed_version'");
  const currentVersion = rows[0]?.value || '0';

  if (currentVersion < SEED_VERSION) {
    console.log(`Running seed v${SEED_VERSION} (additive — existing records preserved)...`);
    let added = 0;
    for (const art of SEED_ARTIFACTS) {
      const blockId = extractArenaBlockId(art.arena_url);
      let imageUrl = null;
      let fetched = false;
      if (blockId) {
        const meta = await fetchArenaBlock(blockId);
        if (meta) {
          imageUrl = meta.imageUrl;
          fetched = true;
        }
      }
      const result = await pool.query(
        `INSERT INTO artifacts (location_id, title, type, period, arena_url, arena_block_id, arena_image_url, arena_fetched, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (location_id, title) DO NOTHING`,
        [art.location_id, art.title, art.type, art.period, art.arena_url, blockId, imageUrl, fetched, art.description]
      );
      if (result.rowCount > 0) added++;
    }
    await pool.query(
      `INSERT INTO app_state (key, value) VALUES ('seed_version', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [SEED_VERSION]
    );
    console.log(`Seed v${SEED_VERSION} complete: ${added} new artifacts added.`);
  }
}

// ─── API routes ───────────────────────────────────────────────────────────────

// GET /api/artifacts — list with optional ?search=, ?location=, ?type=
app.get('/api/artifacts', async (req, res) => {
  try {
    const { search, location, type } = req.query;
    let query = 'SELECT * FROM artifacts WHERE 1=1';
    const params = [];

    if (location && location !== 'all') {
      params.push(location);
      query += ` AND location_id = $${params.length}`;
    }
    if (type && type !== 'all') {
      params.push(type);
      query += ` AND type = $${params.length}`;
    }
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length} OR LOWER(period) LIKE $${params.length} OR LOWER(type) LIKE $${params.length})`;
    }

    query += ' ORDER BY location_id, created_at';
    const { rows } = await pool.query(query, params);
    res.json({ artifacts: rows, locations: LOCATIONS });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/artifacts — create new artifact
app.post('/api/artifacts', async (req, res) => {
  try {
    const { location_id, title, type, period, arena_url, description } = req.body;
    if (!location_id || !title) return res.status(400).json({ error: 'location_id and title are required' });

    const blockId = extractArenaBlockId(arena_url);
    let imageUrl = null;
    let fetched = false;
    if (blockId) {
      const meta = await fetchArenaBlock(blockId);
      if (meta) { imageUrl = meta.imageUrl; fetched = true; }
    }

    const { rows } = await pool.query(
      `INSERT INTO artifacts (location_id, title, type, period, arena_url, arena_block_id, arena_image_url, arena_fetched, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [location_id, title, type || null, period || null, arena_url || null, blockId, imageUrl, fetched, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/artifacts/:id — update artifact
app.put('/api/artifacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location_id, title, type, period, arena_url, description } = req.body;

    const blockId = extractArenaBlockId(arena_url);
    let imageUrl = null;
    let fetched = false;
    if (blockId) {
      const meta = await fetchArenaBlock(blockId);
      if (meta) { imageUrl = meta.imageUrl; fetched = true; }
    }

    const { rows } = await pool.query(
      `UPDATE artifacts SET location_id=$1, title=$2, type=$3, period=$4, arena_url=$5,
       arena_block_id=$6, arena_image_url=$7, arena_fetched=$8, description=$9
       WHERE id=$10 RETURNING *`,
      [location_id, title, type || null, period || null, arena_url || null, blockId, imageUrl, fetched, description || null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/artifacts/:id
app.delete('/api/artifacts/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM artifacts WHERE id=$1 RETURNING id', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/arena/block/:id — proxy are.na block metadata
app.get('/api/arena/block/:id', async (req, res) => {
  try {
    const meta = await fetchArenaBlock(req.params.id);
    if (!meta) return res.status(404).json({ error: 'Block not found or API unavailable' });
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch block' });
  }
});

// GET /api/types — list of all artifact types for filtering
app.get('/api/types', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT DISTINCT type FROM artifacts WHERE type IS NOT NULL ORDER BY type");
    res.json(rows.map(r => r.type));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  try {
    await initDB();
    app.listen(PORT, () => console.log(`Northing artifact catalog running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to initialize:', err);
    process.exit(1);
  }
}

start();
