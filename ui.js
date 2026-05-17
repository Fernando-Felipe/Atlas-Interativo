/* UI helpers: search, clock, FPS, info panel, compass, chips.
   Talks to globe via window.__atlas hooks set by main.js. */
(function () {
  const $ = (id) => document.getElementById(id);

  // ---------- UTC clock ----------
  function tickClock() {
    const d = new Date();
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    $('utc').textContent = `${hh}:${mm}:${ss}`;
  }
  setInterval(tickClock, 1000); tickClock();

  // ---------- FPS counter ----------
  let lastT = performance.now(), frames = 0, fps = 60;
  function fpsLoop(now) {
    frames++;
    if (now - lastT >= 500) {
      fps = Math.round((frames * 1000) / (now - lastT));
      $('fps').textContent = String(fps).padStart(2, '0');
      lastT = now; frames = 0;
    }
    requestAnimationFrame(fpsLoop);
  }
  requestAnimationFrame(fpsLoop);

  // ---------- Cursor tooltip ----------
  const tip = $('cursor-tip');
  let tipName = '';
  function showTip(name) {
    if (!name) { tip.classList.remove('visible'); tipName = ''; return; }
    if (name !== tipName) { tip.textContent = name; tipName = name; }
    tip.classList.add('visible');
  }
  function hideTip() { tip.classList.remove('visible'); tipName = ''; }
  window.addEventListener('mousemove', (e) => {
    tip.style.left = e.clientX + 'px';
    tip.style.top  = e.clientY + 'px';
  });

  // ---------- Number formatting ----------
  const fmtInt = (n) => {
    if (n == null || isNaN(n)) return '—';
    return new Intl.NumberFormat('pt-BR').format(Math.round(n));
  };
  const fmtShort = (n) => {
    if (n == null || isNaN(n)) return '—';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + ' bi';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + ' mi';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + ' mil';
    return String(Math.round(n));
  };

  // ---------- Count-up animation on stat values ----------
  function countUp(el, target, formatter, dur = 900) {
    if (target == null || isNaN(target)) { el.textContent = '—'; return; }
    const start = 0, t0 = performance.now();
    function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = formatter(start + (target - start) * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---------- Panel ----------
  const panel = $('panel');
  function openPanel() { panel.classList.add('open'); }
  function closePanel() {
    panel.classList.remove('open');
    if (window.__atlas && window.__atlas.deselect) window.__atlas.deselect();
  }

  function fillPanel(info, featName) {
    const iso2 = (info && info.cca2 ? info.cca2 : '').toLowerCase();
    const iso3 = info && info.cca3 ? info.cca3 : '—';
    const flagEl = $('panel-flag');
    if (iso2) {
      flagEl.style.backgroundImage = `url(https://flagcdn.com/w160/${iso2}.png)`;
    } else {
      flagEl.style.backgroundImage = '';
    }
    $('panel-iso').textContent = iso3 + (info && info.cca2 ? ' · ' + info.cca2 : '');
    $('panel-name').textContent = (info && info.name && info.name.common) ? info.name.common : featName;
    const region = info ? [info.region, info.subregion].filter(Boolean).join(' · ') : '';
    $('panel-region').textContent = region || '—';

    const pop  = info && info.population;
    const area = info && info.area;
    countUp($('stat-pop'),  pop,  fmtShort);
    countUp($('stat-area'), area, fmtInt);

    $('row-capital').textContent  = info && info.capital && info.capital.length ? info.capital.join(', ') : '—';
    $('row-subregion').textContent = info && info.subregion ? info.subregion : '—';
    $('row-languages').textContent = info && info.languages
      ? Object.values(info.languages).join(', ') : '—';
    $('row-currencies').textContent = info && info.currencies
      ? Object.entries(info.currencies).map(([code, v]) => `${v.name || code} (${v.symbol || code})`).join(', ')
      : '—';
    $('row-latlng').textContent = info && info.latlng
      ? `${info.latlng[0].toFixed(2)}°, ${info.latlng[1].toFixed(2)}°` : '—';
    $('row-density').textContent = (pop && area) ? (pop / area).toFixed(1) + ' hab/km²' : '—';

    openPanel();
  }

  // Panel action buttons
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === 'close') closePanel();
    if (act === 'focus' && window.__atlas && window.__atlas.focus) window.__atlas.focus();
    if (act === 'rotate' && window.__atlas && window.__atlas.orbit) window.__atlas.orbit();
  });
  $('panel-close').addEventListener('click', closePanel);

  // ---------- Search ----------
  const searchEl = $('search');
  const resultsEl = $('search-results');
  let directory = []; // {name, iso2, iso3, latlng}
  let activeIdx = -1;

  function setDirectory(list) {
    directory = list;
    $('country-count').textContent = String(list.length).padStart(3, '0');
  }

  function renderResults(q) {
    if (!q) { resultsEl.classList.remove('open'); return; }
    const Q = q.toLowerCase();
    const hits = directory
      .filter(c => c.name.toLowerCase().includes(Q) || (c.iso2 && c.iso2.toLowerCase().includes(Q)) || (c.iso3 && c.iso3.toLowerCase().includes(Q)))
      .slice(0, 8);
    if (!hits.length) { resultsEl.classList.remove('open'); return; }
    resultsEl.innerHTML = hits.map((c, i) => `
      <div class="search-row${i === activeIdx ? ' active' : ''}" data-iso3="${c.iso3}">
        <div class="flag" style="background-image:url(https://flagcdn.com/w40/${(c.iso2||'').toLowerCase()}.png)"></div>
        <div>${c.name}</div>
        <div class="iso">${c.iso3 || ''}</div>
      </div>`).join('');
    resultsEl.classList.add('open');
  }

  searchEl.addEventListener('input', (e) => { activeIdx = -1; renderResults(e.target.value.trim()); });
  searchEl.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { searchEl.blur(); resultsEl.classList.remove('open'); return; }
    const rows = resultsEl.querySelectorAll('.search-row');
    if (!rows.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = (activeIdx + 1) % rows.length; renderResults(searchEl.value.trim()); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); activeIdx = (activeIdx - 1 + rows.length) % rows.length; renderResults(searchEl.value.trim()); }
    if (e.key === 'Enter')     {
      const pick = rows[activeIdx >= 0 ? activeIdx : 0];
      if (pick && window.__atlas) window.__atlas.selectByIso3(pick.dataset.iso3);
      searchEl.value = ''; resultsEl.classList.remove('open');
    }
  });
  resultsEl.addEventListener('click', (e) => {
    const row = e.target.closest('.search-row');
    if (!row) return;
    if (window.__atlas) window.__atlas.selectByIso3(row.dataset.iso3);
    searchEl.value = ''; resultsEl.classList.remove('open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) resultsEl.classList.remove('open');
  });

  // ---------- Chips ----------
  document.getElementById('chips-dock').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    if (window.__atlas) window.__atlas.selectByIso3(btn.dataset.iso);
  });

  // ---------- Compass + coord readout ----------
  function updatePOV(lat, lng, alt) {
    $('coord-lat').textContent = (lat >= 0 ? ' ' : '') + lat.toFixed(1) + '°';
    $('coord-lng').textContent = (lng >= 0 ? ' ' : '') + lng.toFixed(1) + '°';
    $('coord-alt').textContent = (alt).toFixed(2);
    const needle = document.getElementById('compass-needle');
    needle.setAttribute('transform', `rotate(${-lng} 50 50)`);
  }

  // ---------- Tabs ----------
  let activeTab = 'geral';
  document.querySelector('.panel-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.panel-tab');
    if (!btn) return;
    const tab = btn.dataset.tab;
    if (tab === activeTab) return;
    activeTab = tab;
    document.querySelectorAll('.panel-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-' + tab));
    if (tab === 'geral' && window.__atlas && window.__atlas.clearAllRanges) window.__atlas.clearAllRanges();
  });

  function resetTabs() {
    activeTab = 'geral';
    document.querySelectorAll('.panel-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === 'geral'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.toggle('hidden', p.id !== 'tab-geral'));
    if (window.__atlas && window.__atlas.clearAllRanges) window.__atlas.clearAllRanges();
  }

  // ---------- Military tab ----------
  function fmtNum(n) {
    if (n == null) return '—';
    if (n >= 1e6) return (n/1e6).toFixed(1) + ' mi';
    if (n >= 1e3) return (n/1e3).toFixed(0) + ' mil';
    return String(n);
  }

  let currentMilIso3 = null;

  function fillMilitary(iso3) {
    currentMilIso3 = iso3;
    const el = $('mil-content');
    const d = window.MILITARY_DATA && window.MILITARY_DATA[iso3];
    if (!d) {
      el.innerHTML = '<div class="mil-no-data">Sem dados militares<br>para este país</div>';
      return;
    }
    const isNuclear = d.nuclear != null;
    const badge = isNuclear
      ? `<span class="mil-badge nuclear">POTÊNCIA NUCLEAR</span>`
      : `<span class="mil-badge conventional">CONVENCIONAL</span>`;

    const statsHtml = `
      <div class="mil-stat-grid">
        <div class="mil-stat"><div class="mil-stat-label">Rank GFP</div><div class="mil-stat-value">#${d.gfpRank}</div></div>
        <div class="mil-stat"><div class="mil-stat-label">Orçamento</div><div class="mil-stat-value">$${d.budget}<span class="mil-stat-unit">Bi USD</span></div></div>
        <div class="mil-stat"><div class="mil-stat-label">Efetivo</div><div class="mil-stat-value">${fmtNum(d.personnel)}</div></div>
        <div class="mil-stat"><div class="mil-stat-label">Ogivas Nuc.</div><div class="mil-stat-value">${isNuclear ? d.nuclear.total : '—'}</div></div>
      </div>`;

    const colors = window.MISSILE_COLORS || {};
    const missilesHtml = d.missiles.length ? `
      <div class="mil-section">Clique para ver alcance no globo</div>
      ${d.missiles.map((m, i) => {
        const col = colors[m.type] || '#888888';
        const rangeLabel = m.range >= 1000 ? (m.range/1000).toFixed(1)+'k' : m.range;
        return `<div class="mil-missile" data-iso="${iso3}" data-idx="${i}" data-range="${m.range}" data-color="${col}">
          <div class="mil-missile-check" style="border-color:${col};background:${col}"></div>
          <div class="mil-missile-name">${m.name}</div>
          <div class="mil-missile-type">${m.type}</div>
          <div class="mil-missile-range">${rangeLabel} km</div>
        </div>`;
      }).join('')}` : '';

    el.innerHTML = badge + statsHtml + missilesHtml;

    el.querySelectorAll('.mil-missile').forEach(row => {
      row.addEventListener('click', () => {
        const iso  = row.dataset.iso;
        const idx  = row.dataset.idx;
        const range = parseFloat(row.dataset.range);
        const color = row.dataset.color;
        const key  = `${iso}_${idx}`;
        const isActive = row.classList.toggle('active');
        if (window.__atlas && window.__atlas.toggleRange) {
          window.__atlas.toggleRange(key, range, color, isActive);
        }
      });
    });
  }

  // ---------- Public ----------
  window.__atlas_ui = {
    showTip, hideTip,
    fillPanel, closePanel,
    fillMilitary,
    resetTabs,
    setDirectory,
    updatePOV,
    loaderText: (t) => { const el = $('loader-text'); if (el) el.textContent = t; },
    hideLoader: () => $('loader').classList.add('hidden'),
  };
})();
