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

  const { rows } = await pool.query("SELECT value FROM app_state WHERE key = 'seeded'");
  if (rows.length === 0) {
    console.log('Seeding artifact catalog...');
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
      await pool.query(
        `INSERT INTO artifacts (location_id, title, type, period, arena_url, arena_block_id, arena_image_url, arena_fetched, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [art.location_id, art.title, art.type, art.period, art.arena_url, blockId, imageUrl, fetched, art.description]
      );
    }
    await pool.query("INSERT INTO app_state (key, value) VALUES ('seeded', 'true')");
    console.log(`Seeded ${SEED_ARTIFACTS.length} artifacts.`);
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
