/* =========================================================
   MAPA 3D — main globe logic
   - 3D globe (globe.gl) with extruded countries
   - idle auto-rotation that pauses on user interaction
   - hover with cursor tooltip
   - click → selection: pop-up extrusion + side panel with REST Countries data
   - focus mode (F): hides all other countries & zooms
   - search / chip → flyTo by ISO3
   - decorative arcs between major capitals
   ========================================================= */

const GEOJSON_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';
const REST_URL    = 'https://restcountries.com/v3.1/all?fields=name,cca2,cca3,capital,population,area,region,subregion,languages,latlng';

// ----- palette -----
const COL_CAP_DEFAULT  = 'rgba(8, 14, 32, 0.95)';
const COL_CAP_HOVER    = 'rgba(20, 28, 60, 1)';
const COL_CAP_SELECTED = 'rgba(40, 30, 8, 1)';
const COL_SIDE_DEFAULT  = 'rgba(255, 216, 107, 0.55)';
const COL_SIDE_HOVER    = 'rgba(255, 216, 107, 0.85)';
const COL_SIDE_SELECTED = 'rgba(255, 233, 168, 0.95)';
const COL_STROKE_DEFAULT  = '#FFD86B';
const COL_STROKE_HOVER    = '#FFE9A8';
const COL_STROKE_SELECTED = '#FFF3C6';

const BG_COLOR     = '#00010a';
const GLOBE_COLOR  = 0x040a1c;
const GLOBE_EMIT   = 0x010210;

const ALT_DEFAULT  = 0.006;
const ALT_HOVER    = 0.04;
const ALT_SELECTED = 0.12;
const ALT_HIDDEN   = 0.0;

const ANIM_MS = 480;

// ----- state -----
let countries     = [];       // GeoJSON features
let infoByIso3    = {};       // REST Countries lookup
let altitudes     = {};       // animated altitudes keyed by feature name
let selected      = null;     // feature
let hovered       = null;     // feature
let selectedCapitalLatLng = null;
let capitalCoords = {};
let focusMode     = false;
let userInteracted= false;
let lastUserT     = 0;
let orbiting      = false;    // user-toggled cinematic orbit
let currentIso3   = null;     // ISO3 do país selecionado

const UI = () => window.__atlas_ui;

// ----- globe -----
const globe = Globe()
  .backgroundColor(BG_COLOR)
  .showGlobe(true)
  .showAtmosphere(true)
  .atmosphereColor('rgb(110, 180, 255)')
  .atmosphereAltitude(0.18)
  .globeImageUrl(null)
  .polygonsData([])
  .polygonAltitude(getAlt)
  .polygonCapColor(getCapColor)
  .polygonSideColor(getSideColor)
  .polygonStrokeColor(getStrokeColor)
  .polygonLabel(() => null)
  .onPolygonHover(onHover)
  .onPolygonClick(onClick)
  // arcs
  .arcsData([])
  .arcStartLat(d => d.startLat).arcStartLng(d => d.startLng)
  .arcEndLat(d => d.endLat).arcEndLng(d => d.endLng)
  .arcColor(() => ['rgba(255, 216, 107, 0)', 'rgba(255, 216, 107, 0.75)', 'rgba(255, 216, 107, 0)'])
  .arcStroke(0.35)
  .arcDashLength(0.4)
  .arcDashGap(2.4)
  .arcDashAnimateTime(d => d.speed)
  .arcAltitudeAutoScale(0.42)
  // points at capital nodes
  .pointsData([])
  .pointLat(d => d.lat).pointLng(d => d.lng)
  .pointColor(d => d.isCapital ? '#ffffff' : '#FFD86B')
  .pointRadius(d => d.isCapital ? 0.35 : 0.18)
  .pointAltitude(d => d.isCapital ? ALT_SELECTED + 0.01 : 0.005)
  // selected capital label
  .labelsData([])
  .labelLat(d => d.lat)
  .labelLng(d => d.lng)
  .labelText(d => d.text)
  .labelColor(() => '#ffffff')
  .labelSize(0.7)
  .labelDotRadius(0.45)
  .labelDotOrientation(() => 'bottom')
  .labelResolution(6)
  .labelAltitude(ALT_SELECTED + 0.02)
  (document.getElementById('globe-container'));

globe.scene().background = null;
globe.renderer().setClearColor(0x000000, 0);
globe.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
globe.globeMaterial().color.set(GLOBE_COLOR);
globe.globeMaterial().emissive.set(GLOBE_EMIT);
globe.globeMaterial().emissiveIntensity = 1;

// initial pov
globe.pointOfView({ lat: 14, lng: -30, altitude: 2.4 });

// camera controls hooks → mark user interaction, update HUD
const controls = globe.controls();
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.autoRotate    = false;
controls.minDistance   = 110;
controls.maxDistance   = 600;

['start', 'change'].forEach(ev => controls.addEventListener(ev, () => {
  userInteracted = true; lastUserT = performance.now();
}));

// ----- color/altitude resolvers -----
function nameOf(f) { return f.properties.NAME; }

function getAlt(f) {
  if (f.properties._isRange) {
    return selected ? ALT_SELECTED + 0.01 : 0.02;
  }
  return altitudes[nameOf(f)] ?? ALT_DEFAULT;
}
function getCapColor(f) {
  if (f.properties._isRange) return f.properties._fill;
  const n = nameOf(f);
  if (focusMode && (!selected || nameOf(selected) !== n)) return 'rgba(0,0,0,0)';
  if (selected && nameOf(selected) === n) return COL_CAP_SELECTED;
  if (hovered  && nameOf(hovered)  === n) return COL_CAP_HOVER;
  return COL_CAP_DEFAULT;
}
function getSideColor(f) {
  if (f.properties._isRange) return 'rgba(0,0,0,0)';
  const n = nameOf(f);
  if (focusMode && (!selected || nameOf(selected) !== n)) return 'rgba(0,0,0,0)';
  if (selected && nameOf(selected) === n) return COL_SIDE_SELECTED;
  if (hovered  && nameOf(hovered)  === n) return COL_SIDE_HOVER;
  return COL_SIDE_DEFAULT;
}
function getStrokeColor(f) {
  if (f.properties._isRange) return f.properties._stroke;
  const n = nameOf(f);
  if (focusMode && (!selected || nameOf(selected) !== n)) return 'rgba(0,0,0,0)';
  if (selected && nameOf(selected) === n) return COL_STROKE_SELECTED;
  if (hovered  && nameOf(hovered)  === n) return COL_STROKE_HOVER;
  return COL_STROKE_DEFAULT;
}
function refresh() {
  globe
    .polygonCapColor(getCapColor)
    .polygonSideColor(getSideColor)
    .polygonStrokeColor(getStrokeColor);
}

// animate altitude for a feature with cubic easing
function animateAlt(name, target, done) {
  const start = altitudes[name] ?? ALT_DEFAULT;
  const t0 = performance.now();
  function step(now) {
    const t = Math.min((now - t0) / ANIM_MS, 1);
    const e = 1 - Math.pow(1 - t, 3);
    altitudes[name] = start + (target - start) * e;
    globe.polygonAltitude(getAlt);
    if (t < 1) requestAnimationFrame(step);
    else if (done) done();
  }
  requestAnimationFrame(step);
}

// ----- interaction handlers -----
function onHover(feat, prev) {
  if (feat && feat.properties._isRange) return;
  if (focusMode) { UI().hideTip(); return; }
  if (hovered && (!feat || nameOf(hovered) !== nameOf(feat))) {
    const hn = nameOf(hovered);
    if (!selected || nameOf(selected) !== hn) animateAlt(hn, ALT_DEFAULT);
  }
  hovered = feat || null;
  if (feat) {
    const n = nameOf(feat);
    if (!selected || nameOf(selected) !== n) animateAlt(n, ALT_HOVER);
    UI().showTip(displayName(feat));
    document.body.style.cursor = 'pointer';
  } else {
    UI().hideTip();
    document.body.style.cursor = '';
  }
  refresh();
}

function onClick(feat) {
  if (feat && feat.properties._isRange) return;
  userInteracted = true; lastUserT = performance.now();
  if (focusMode) { exitFocus(); return; }
  selectFeature(feat);
}

// Programmatic select (search / chips)
function selectByIso3(iso3) {
  const feat = countries.find(f => (f.properties.ISO_A3 === iso3) || (f.properties.ADM0_A3 === iso3));
  if (!feat) return;
  selectFeature(feat, { fly: true });
}

function selectFeature(feat, opts = {}) {
  if (!feat) return;
  if (selected && nameOf(selected) === nameOf(feat)) {
    // toggle off
    deselect();
    return;
  }
  if (selected) animateAlt(nameOf(selected), ALT_DEFAULT);
  clearAllRanges();
  selected = feat;
  animateAlt(nameOf(feat), ALT_SELECTED);
  refresh();

  // fly camera to country centroid
  const c = centroidOf(feat);
  if (c) {
    const targetAlt = opts.fly ? Math.max(0.9, Math.min(2.0, c.span / 35)) : null;
    if (targetAlt != null) {
      globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: targetAlt }, 1200);
    } else {
      // gentle nudge so the country is visible
      const cur = globe.pointOfView();
      globe.pointOfView({ lat: c.lat * 0.6 + cur.lat * 0.4, lng: c.lng * 0.6 + cur.lng * 0.4, altitude: cur.altitude }, 900);
    }
  }

  // open panel with REST country info + military data
  const iso3 = feat.properties.ISO_A3 || feat.properties.ADM0_A3;
  const info = infoByIso3[iso3] || infoByIso3[feat.properties.ADM0_A3];
  const milIso3 = (info && info.cca3) || iso3;
  UI().fillPanel(info, displayName(feat));
  UI().fillMilitary(milIso3);
  UI().resetTabs();
  currentIso3 = iso3;

  // capital label + white dot
  const capName   = info && info.capital && info.capital[0];
  const iso3Key   = feat.properties.ISO_A3 || feat.properties.ADM0_A3;
  const capLatlng = capitalCoords[iso3Key] ? [capitalCoords[iso3Key].lat, capitalCoords[iso3Key].lng] : (info && info.latlng);

  if (capName && capLatlng) {
    selectedCapitalLatLng = { lat: capLatlng[0], lng: capLatlng[1] };
    const capLabel = capName.split('').map(c => c.normalize('NFD')[0]).join('');
    globe.labelsData([{ lat: capLatlng[0], lng: capLatlng[1], text: capLabel }]);
  } else {
    selectedCapitalLatLng = null;
    globe.labelsData([]);
  }
  updateCapitalPoint();
}

function deselect() {
  if (!selected) return;
  animateAlt(nameOf(selected), ALT_DEFAULT);
  selected = null;
  currentIso3 = null;
  clearAllRanges();
  selectedCapitalLatLng = null;
  updateCapitalPoint();
  globe.labelsData([]);
  UI().closePanel();
  UI().resetTabs();
  refresh();
}

function enterFocus() {
  if (!selected) return;
  focusMode = true;
  countries.forEach(f => {
    if (f !== selected) altitudes[nameOf(f)] = ALT_HIDDEN;
  });
  globe.polygonAltitude(getAlt);
  refresh();
  const c = centroidOf(selected);
  if (c) {
    const alt = Math.max(0.45, Math.min(1.8, c.span / 45));
    globe.pointOfView({ lat: c.lat, lng: c.lng, altitude: alt }, 1100);
  }
}
function exitFocus() {
  focusMode = false;
  countries.forEach(f => {
    if (!selected || nameOf(selected) !== nameOf(f)) altitudes[nameOf(f)] = ALT_DEFAULT;
  });
  globe.polygonAltitude(getAlt);
  refresh();
  globe.pointOfView({ lat: 14, lng: -30, altitude: 2.4 }, 1100);
}

// orbit toggle (cinematic spin)
function toggleOrbit() {
  orbiting = !orbiting;
  controls.autoRotate = orbiting;
  controls.autoRotateSpeed = orbiting ? -0.9 : 0;
  userInteracted = !orbiting; // don't fight with idle-resume
}

// helpers
function displayName(f) {
  const p = f.properties;
  return p.NAME_LONG || p.NAME || p.ADMIN || 'Desconhecido';
}

function centroidOf(feat) {
  const flat = [];
  function walk(arr, depth) {
    if (depth === 0) { flat.push(arr); return; }
    arr.forEach(c => walk(c, depth - 1));
  }
  if (feat.geometry.type === 'Polygon')       walk(feat.geometry.coordinates, 2);
  if (feat.geometry.type === 'MultiPolygon')  walk(feat.geometry.coordinates, 3);
  if (!flat.length) return null;
  let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
  flat.forEach(([lng, lat]) => {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  });
  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
    span: Math.max(maxLat - minLat, maxLng - minLng),
  };
}

// ----- decorative arcs between major capitals -----
const CAPITALS = [
  { name: 'Brasília',     lat: -15.78, lng: -47.93 },
  { name: 'Washington',   lat:  38.90, lng: -77.04 },
  { name: 'Mexico City',  lat:  19.43, lng: -99.13 },
  { name: 'London',       lat:  51.50, lng:  -0.13 },
  { name: 'Paris',        lat:  48.86, lng:   2.35 },
  { name: 'Berlin',       lat:  52.52, lng:  13.40 },
  { name: 'Cairo',        lat:  30.04, lng:  31.24 },
  { name: 'Lagos',        lat:   6.52, lng:   3.38 },
  { name: 'Cape Town',    lat: -33.93, lng:  18.42 },
  { name: 'Moscow',       lat:  55.75, lng:  37.62 },
  { name: 'Dubai',        lat:  25.20, lng:  55.27 },
  { name: 'Mumbai',       lat:  19.07, lng:  72.87 },
  { name: 'Beijing',      lat:  39.90, lng: 116.40 },
  { name: 'Tokyo',        lat:  35.68, lng: 139.69 },
  { name: 'Sydney',       lat: -33.86, lng: 151.20 },
  { name: 'Buenos Aires', lat: -34.60, lng: -58.38 },
  { name: 'Reykjavík',    lat:  64.13, lng: -21.94 },
  { name: 'Singapore',    lat:   1.35, lng: 103.81 },
];

function buildArcs() {
  const arcs = [];
  for (let i = 0; i < 14; i++) {
    const a = CAPITALS[Math.floor(Math.random() * CAPITALS.length)];
    let b = CAPITALS[Math.floor(Math.random() * CAPITALS.length)];
    while (b === a) b = CAPITALS[Math.floor(Math.random() * CAPITALS.length)];
    arcs.push({
      startLat: a.lat, startLng: a.lng,
      endLat:   b.lat, endLng:   b.lng,
      speed: 2400 + Math.random() * 2400,
    });
  }
  return arcs;
}

// ----- main loop: idle rotation + HUD readout + starfield (single RAF) -----
let idlePrev = performance.now();
function idleLoop() {
  const now = performance.now();
  const dt = (now - idlePrev) / 1000; idlePrev = now;

  if (!focusMode && !orbiting && !controls.autoRotate) {
    if (now - lastUserT > 4000) {
      const pov = globe.pointOfView();
      pov.lng += dt * 1.6; // 1.6°/s
      globe.pointOfView(pov);
    }
  }
  const p = globe.pointOfView();
  UI().updatePOV(p.lat, p.lng, p.altitude);
  requestAnimationFrame(idleLoop);
}
requestAnimationFrame(idleLoop);

// ----- keyboard -----
document.addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (e.key === 'f' || e.key === 'F') {
    if (!selected) return;
    if (focusMode) exitFocus(); else enterFocus();
  }
  if (e.key === 'r' || e.key === 'R') toggleOrbit();
  if (e.key === 'Escape') {
    if (focusMode) { exitFocus(); return; }
    if (selected) deselect();
  }
});

// ----- geodesic range circles -----
const activeRanges = {};

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function geodesicCircle(lat, lng, rangeKm, segments = 72) {
  const R = 6371;
  const d = Math.min(rangeKm / R, Math.PI * 0.99);
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const bearing = (i / segments) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
    );
    const lng2 = lng1 + Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
      Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );
    pts.push([lng2 * 180 / Math.PI, lat2 * 180 / Math.PI]);
  }
  return pts;
}

function updateCapitalPoint() {
  if (selectedCapitalLatLng) {
    globe.pointsData([...CAPITALS, { ...selectedCapitalLatLng, isCapital: true }]);
  } else {
    globe.pointsData(CAPITALS);
  }
}

function toggleRange(key, rangeKm, color, isActive) {
  if (!isActive) {
    delete activeRanges[key];
  } else {
    const c = selectedCapitalLatLng || (selected ? centroidOf(selected) : null);
    if (!c) return;
    const coords = geodesicCircle(c.lat, c.lng, rangeKm);
    activeRanges[key] = {
      type: 'Feature',
      properties: {
        _isRange: true,
        _fill:   hexToRgba(color, 0.13),
        _stroke: hexToRgba(color, 0.85),
        NAME: '_RANGE_' + key,
      },
      geometry: { type: 'Polygon', coordinates: [coords] },
    };
  }
  globe.polygonsData([...countries, ...Object.values(activeRanges)]);
  refresh();
}

function clearAllRanges() {
  Object.keys(activeRanges).forEach(k => delete activeRanges[k]);
  if (countries.length) globe.polygonsData([...countries]);
}

// expose hooks for UI module
window.__atlas = {
  selectByIso3,
  deselect,
  focus: () => { if (!focusMode) enterFocus(); else exitFocus(); },
  orbit: toggleOrbit,
  toggleRange,
  clearAllRanges,
};

// ----- bootstrap: load geo + country info in parallel -----
UI().loaderText('Carregando geografia');

const pGeo  = fetch(GEOJSON_URL).then(r => r.json());
const pCaps = fetch('capitals.json').then(r => r.json()).catch(() => ({}));
const pInfo = fetch(REST_URL)
  .then(r => { if (!r.ok) throw new Error('REST Countries HTTP ' + r.status); return r.json(); })
  .then(j => Array.isArray(j) ? j : [])
  .catch(e => { console.error('[atlas] REST Countries falhou:', e); return []; });

Promise.all([pGeo, pInfo, pCaps])
  .then(([geo, info, caps]) => {
    capitalCoords = caps || {};
    countries = geo.features;
    infoByIso3 = {};
    (Array.isArray(info) ? info : []).forEach(c => { if (c.cca3) infoByIso3[c.cca3] = c; });

    // build searchable directory
    const dir = countries.map(f => {
      const iso3 = f.properties.ISO_A3 || f.properties.ADM0_A3;
      const i    = infoByIso3[iso3];
      return {
        name: (i && i.name && i.name.common) || displayName(f),
        iso2: i ? i.cca2 : '',
        iso3,
      };
    }).filter(d => d.iso3 && d.iso3 !== '-99')
      .sort((a, b) => a.name.localeCompare(b.name));
    UI().setDirectory(dir);

    UI().loaderText('Construindo malha');
    setTimeout(() => {
      globe.polygonsData([...countries, ...Object.values(activeRanges)]);
      globe.arcsData(buildArcs());
      globe.pointsData(CAPITALS);
      UI().loaderText('Pronto');
      setTimeout(() => UI().hideLoader(), 350);
    }, 50);
  })
  .catch(() => {
    UI().loaderText('Erro de rede. Verifique sua conexão.');
  });

// regen arcs every 14s
setInterval(() => { if (!focusMode) globe.arcsData(buildArcs()); }, 14000);
