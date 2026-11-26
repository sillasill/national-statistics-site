// Page renderers for the Nusaraya Statistics Office site.
// Each render function takes the view element, the shared state, and an
// update() callback that merges new state and re-renders the current page.
// Every figure shown is labelled with its source and year.

import { YEARS, COUNTRY, SERIES, SECTORS, GDP_SHARES, AGE_GROUPS, PROVINCES, RELEASES, CALENDAR, ABOUT } from './data.js';
import { drawLineChart, drawBarChart, drawDonutChart, drawTwoLines, drawHorizontalBars } from './charts.js';

const PALETTE = ['#0f766e', '#b45309', '#1d4ed8', '#be185d', '#15803d', '#7c3aed', '#a16207', '#0e7490'];

export function fmt(value, decimals = 1) {
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function yearIndex(year) {
  return YEARS.indexOf(year);
}

function changeText(seriesKey, year) {
  const i = yearIndex(year);
  if (i <= 0) return { text: '—', cls: 'flat' };
  const now = SERIES[seriesKey].values[i];
  const prev = SERIES[seriesKey].values[i - 1];
  const diff = now - prev;
  const sign = diff > 0 ? '+' : '';
  const good = seriesKey === 'unemployment' || seriesKey === 'inflation' || seriesKey === 'infantMortality'
    ? diff < 0 : diff > 0;
  return {
    text: sign + fmt(diff, seriesKey === 'gdp' ? 0 : 1) + ' vs ' + YEARS[i - 1],
    cls: diff === 0 ? 'flat' : good ? 'up' : 'down',
  };
}

function kpiCard(seriesKey, year, decimals) {
  const series = SERIES[seriesKey];
  const value = series.values[yearIndex(year)];
  const change = changeText(seriesKey, year);
  return '<div class="card kpi">'
    + '<div class="kpi-label">' + series.label + '</div>'
    + '<div class="kpi-value">' + fmt(value, decimals === undefined ? 1 : decimals) + '</div>'
    + '<div class="kpi-unit">' + series.unit + ' · ' + year + '</div>'
    + '<div class="kpi-change ' + change.cls + '">' + change.text + '</div>'
    + '<div class="source-note">Source: ' + series.source + '.</div>'
    + '</div>';
}

function yearSelect(state, update) {
  return '<label for="year-pick">Reference year</label>'
    + '<select id="year-pick" data-control="year">'
    + YEARS.map((y) => '<option value="' + y + '"' + (y === state.year ? ' selected' : '') + '>' + y + '</option>').join('')
    + '</select>';
}

function chartToggle(state, update) {
  return '<span class="btn-group" role="group" aria-label="Chart type">'
    + '<button type="button" data-control="chart" data-value="line" aria-pressed="' + (state.chart === 'line') + '">Line</button>'
    + '<button type="button" data-control="chart" data-value="bar" aria-pressed="' + (state.chart === 'bar') + '">Bar</button>'
    + '</span>';
}

function drawSeriesChart(canvas, seriesKey, state, options = {}) {
  const series = SERIES[seriesKey];
  if (state.chart === 'bar') {
    // Bars always start at zero; a truncated axis would mislead.
    drawBarChart(canvas, YEARS, series.values, { color: '#0f766e' });
  } else {
    drawLineChart(canvas, YEARS, series.values, { color: '#0f766e', min: options.min, max: options.max });
  }
}

function wireControls(root, update) {
  root.querySelectorAll('[data-control="year"]').forEach((el) => {
    el.addEventListener('change', () => update({ year: Number(el.value) }));
  });
  root.querySelectorAll('[data-control="chart"]').forEach((el) => {
    el.addEventListener('click', () => update({ chart: el.getAttribute('data-value') }));
  });
}

function seriesTable(seriesKeys, highlightYear) {
  let html = '<table class="data"><caption>Annual indicators, 2019–' + YEARS[YEARS.length - 1] + '</caption><thead><tr><th>Year</th>';
  seriesKeys.forEach((key) => { html += '<th>' + SERIES[key].label + '</th>'; });
  html += '</tr></thead><tbody>';
  YEARS.forEach((year, i) => {
    html += '<tr' + (year === highlightYear ? ' style="background:#f0fdfa;font-weight:700"' : '') + '><td>' + year + '</td>';
    seriesKeys.forEach((key) => {
      const decimals = key === 'gdp' ? 0 : 1;
      html += '<td>' + fmt(SERIES[key].values[i], decimals) + '</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  return html;
}

function sourceLine(seriesKeys) {
  const sources = [...new Set(seriesKeys.map((key) => SERIES[key].source))];
  return '<p class="source-note">Source: ' + sources.join('; ') + '.</p>';
}

// Attach click-to-sort to a table. columns: array of {key, numeric}.
// rows: array of row objects. renderRows(rows) rewrites the tbody.
export function makeSortable(table, rows, renderRows) {
  const headers = table.querySelectorAll('thead th');
  let sortKey = null;
  let sortDir = 1;
  headers.forEach((th) => {
    const key = th.getAttribute('data-sort');
    if (!key) return;
    th.classList.add('sortable');
    th.addEventListener('click', () => {
      if (sortKey === key) {
        sortDir = -sortDir;
      } else {
        sortKey = key;
        sortDir = 1;
      }
      headers.forEach((h) => h.classList.remove('sorted-asc', 'sorted-desc'));
      th.classList.add(sortDir === 1 ? 'sorted-asc' : 'sorted-desc');
      const sorted = [...rows].sort((a, b) => {
        const av = a[key];
        const bv = b[key];
        if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * sortDir;
        return String(av).localeCompare(String(bv)) * sortDir;
      });
      renderRows(sorted);
    });
  });
}

export function downloadCSV(filename, headers, rows) {
  const escapeCell = (cell) => '"' + String(cell).replace(/"/g, '""') + '"';
  const lines = [headers.map(escapeCell).join(',')];
  rows.forEach((row) => lines.push(row.map(escapeCell).join(',')));
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// ---------------- Dashboard ----------------

export function renderDashboard(root, state, update) {
  root.innerHTML = '<div class="page-head"><h1>Nusaraya in numbers</h1>'
    + '<p>The official statistics of the Republic of Nusaraya, published by the '
    + COUNTRY.office + ' (NSO). Population ' + fmt(SERIES.population.values[6]) + ' million in 2025; '
    + 'capital ' + COUNTRY.capital + '; ' + COUNTRY.provinces + ' provinces.</p></div>'
    + '<div class="controls">' + yearSelect(state, update) + '</div>'
    + '<div class="grid kpis">'
    + kpiCard('population', state.year, 2)
    + kpiCard('gdp', state.year, 0)
    + kpiCard('unemployment', state.year, 1)
    + kpiCard('inflation', state.year, 1)
    + kpiCard('lifeExpectancy', state.year, 1)
    + kpiCard('literacy', state.year, 1)
    + '</div>'
    + '<div class="grid two" style="margin-top:16px">'
    + '<section class="card"><h2>Population, 2019–2025</h2>'
    + '<p class="lede">Mid-year population in millions. Nusaraya grew by about 0.7% a year.</p>'
    + '<canvas class="chart" id="chart-pop" role="img" aria-label="Line chart of population 2019 to 2025"></canvas>'
    + sourceLine(['population']) + '</section>'
    + '<section class="card"><h2>GDP, 2019–2025</h2>'
    + '<p class="lede">Gross domestic product in billion Nusaraya dollars, current prices.</p>'
    + '<canvas class="chart" id="chart-gdp" role="img" aria-label="Bar chart of GDP 2019 to 2025"></canvas>'
    + sourceLine(['gdp']) + '</section>'
    + '</div>'
    + '<div class="grid main-side" style="margin-top:16px">'
    + '<section class="card"><h2>Latest releases</h2>'
    + '<ul class="release-list">'
    + RELEASES.map((r) => '<li><div class="date">' + r.date + '</div><div class="title">' + r.title + '</div><div class="note">' + r.note + '</div></li>').join('')
    + '</ul></section>'
    + '<section class="card"><h2>Largest provinces, 2025</h2>'
    + '<p class="lede">Share of the 48.62 million population. See the full table on the Regions page.</p>'
    + '<table class="data"><thead><tr><th>Province</th><th>People (m)</th></tr></thead><tbody>'
    + [...PROVINCES].sort((a, b) => b.population - a.population).slice(0, 5)
        .map((p) => '<tr><td>' + p.name + '</td><td>' + fmt(p.population, 2) + '</td></tr>').join('')
    + '</tbody></table>'
    + '<p class="source-note">Source: NSO Population Estimates 2025.</p>'
    + '<p><a href="#/regions">Explore all 8 provinces →</a></p>'
    + '</section></div>';
  wireControls(root, update);
  drawLineChart(root.querySelector('#chart-pop'), YEARS, SERIES.population.values, { color: '#0f766e', min: 40, max: 50 });
  drawBarChart(root.querySelector('#chart-gdp'), YEARS, SERIES.gdp.values, { color: '#b45309' });
}

// ---------------- Population ----------------

export function renderPopulation(root, state, update) {
  const growth = YEARS.map((y, i) => (i === 0 ? null : ((SERIES.population.values[i] / SERIES.population.values[i - 1] - 1) * 100)));
  root.innerHTML = '<div class="page-head"><h1>Population</h1>'
    + '<p>How many people live in Nusaraya, how fast the population grows, and how it is spread across age groups and provinces.</p></div>'
    + '<div class="controls">' + chartToggle(state, update) + '</div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>Population trend</h2>'
    + '<p class="lede">Mid-year population, millions, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-pop-trend" role="img" aria-label="Chart of population 2019 to 2025"></canvas>'
    + sourceLine(['population']) + '</section>'
    + '<section class="card"><h2>Age structure, 2025</h2>'
    + '<p class="lede">Share of the population by age group. Median age: 31.4 years.</p>'
    + '<canvas class="chart" id="chart-age" role="img" aria-label="Donut chart of age groups in 2025"></canvas>'
    + '<ul class="legend">'
    + AGE_GROUPS.map((g, i) => '<li><span class="swatch" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' + g.group + '<span class="pct">' + fmt(g.share) + '%</span></li>').join('')
    + '</ul><p class="source-note">Source: NSO Population Estimates 2025.</p></section>'
    + '</div>'
    + '<section class="card" style="margin-top:16px"><h2>Population by year</h2>'
    + seriesTable(['population'], state.year)
    + '<p class="source-note">Annual growth 2025: ' + fmt(growth[6]) + '%. Source: NSO Population Estimates 2025. '
    + 'Estimates use the 2020 census as the base and are updated with births, deaths and migration records.</p>'
    + '</section>';
  wireControls(root, update);
  drawSeriesChart(root.querySelector('#chart-pop-trend'), 'population', state, { min: 40, max: 50 });
  drawDonutChart(root.querySelector('#chart-age'), AGE_GROUPS.map((g) => ({ share: g.share })), { centerLabel: '48.62m', centerSub: 'people, 2025' });
}

// ---------------- Economy ----------------

export function renderEconomy(root, state, update) {
  root.innerHTML = '<div class="page-head"><h1>Economy</h1>'
    + '<p>Gross domestic product, growth, prices and what Nusaraya produces. GDP per person reached 10,717 NRD in 2025.</p></div>'
    + '<div class="controls">' + yearSelect(state, update) + chartToggle(state, update) + '</div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>GDP trend</h2>'
    + '<p class="lede">Billion NRD, current prices, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-gdp-trend" role="img" aria-label="Chart of GDP 2019 to 2025"></canvas>'
    + sourceLine(['gdp']) + '</section>'
    + '<section class="card"><h2>GDP growth and inflation</h2>'
    + '<p class="lede">Real GDP growth (teal) and consumer price inflation (amber), percent, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-growth" role="img" aria-label="Chart of GDP growth and inflation 2019 to 2025"></canvas>'
    + sourceLine(['gdpGrowth', 'inflation']) + '</section>'
    + '</div>'
    + '<div class="grid two" style="margin-top:16px">'
    + '<section class="card"><h2>What Nusaraya produces, 2025</h2>'
    + '<p class="lede">Share of GDP by industry. Manufacturing is the largest single industry at 21.5%.</p>'
    + '<canvas class="chart" id="chart-shares" role="img" aria-label="Donut chart of GDP shares by industry in 2025"></canvas>'
    + '<ul class="legend">'
    + GDP_SHARES.map((g, i) => '<li><span class="swatch" style="background:' + PALETTE[i % PALETTE.length] + '"></span>' + g.name + '<span class="pct">' + fmt(g.share) + '%</span></li>').join('')
    + '</ul><p class="source-note">Source: NSO National Accounts 2025.</p></section>'
    + '<section class="card"><h2>Economy by year</h2>'
    + seriesTable(['gdp', 'gdpGrowth', 'inflation'], state.year)
    + sourceLine(['gdp', 'gdpGrowth', 'inflation'])
    + '<p>The 2020 fall of 3.4% was the pandemic year; growth has been between 5.0% and 6.4% every year since.</p>'
    + '</section></div>';
  wireControls(root, update);
  drawSeriesChart(root.querySelector('#chart-gdp-trend'), 'gdp', state);
  drawTwoLines(root.querySelector('#chart-growth'), YEARS,
    { label: 'GDP growth', values: SERIES.gdpGrowth.values, color: '#0f766e' },
    { label: 'Inflation', values: SERIES.inflation.values, color: '#b45309' },
    { min: -4 });
}

// ---------------- Labour ----------------

export function renderLabour(root, state, update) {
  root.innerHTML = '<div class="page-head"><h1>Labour</h1>'
    + '<p>Who works in Nusaraya, who is looking for work, and where the jobs are. The labour force numbered 23.3 million people in 2025.</p></div>'
    + '<div class="controls">' + chartToggle(state, update) + '</div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>Unemployment rate</h2>'
    + '<p class="lede">Percent of the labour force, 2019–2025. Youth unemployment (ages 15–24) was 11.8% in 2025.</p>'
    + '<canvas class="chart" id="chart-unemp" role="img" aria-label="Chart of unemployment 2019 to 2025"></canvas>'
    + sourceLine(['unemployment']) + '</section>'
    + '<section class="card"><h2>Labour force participation</h2>'
    + '<p class="lede">Percent of the working-age population in work or looking for work, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-part" role="img" aria-label="Chart of labour force participation 2019 to 2025"></canvas>'
    + sourceLine(['participation']) + '</section>'
    + '</div>'
    + '<div class="grid two" style="margin-top:16px">'
    + '<section class="card"><h2>Employment by sector, 2025</h2>'
    + '<p class="lede">Services employ 48.0% of workers; agriculture still employs 27.6%.</p>'
    + '<canvas class="chart" id="chart-sectors" role="img" aria-label="Bar chart of employment by sector in 2025"></canvas>'
    + '<p class="source-note">Source: NSO Labour Force Survey 2025. Workers in millions.</p></section>'
    + '<section class="card"><h2>Labour by year</h2>'
    + seriesTable(['unemployment', 'participation'], state.year)
    + sourceLine(['unemployment', 'participation'])
    + '<p>Average monthly earnings reached 1,940 NRD in 2025, up 4.6% on 2024. Source: NSO Labour Force Survey 2025.</p>'
    + '</section></div>';
  wireControls(root, update);
  drawSeriesChart(root.querySelector('#chart-unemp'), 'unemployment', state);
  drawSeriesChart(root.querySelector('#chart-part'), 'participation', state);
  drawHorizontalBars(root.querySelector('#chart-sectors'), SECTORS.map((s) => ({ label: s.name, value: s.share, valueText: fmt(s.share) + '% · ' + fmt(s.workers) + 'm' })));
}

// ---------------- Health ----------------

export function renderHealth(root, state, update) {
  root.innerHTML = '<div class="page-head"><h1>Health</h1>'
    + '<p>How long people in Nusaraya live, how many children survive their first year, and the health system behind those numbers.</p></div>'
    + '<div class="controls">' + yearSelect(state, update) + chartToggle(state, update) + '</div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>Life expectancy at birth</h2>'
    + '<p class="lede">Years, 2019–2025. Women: 76.4 years; men: 71.9 years in 2025.</p>'
    + '<canvas class="chart" id="chart-life" role="img" aria-label="Chart of life expectancy 2019 to 2025"></canvas>'
    + sourceLine(['lifeExpectancy']) + '</section>'
    + '<section class="card"><h2>Infant mortality</h2>'
    + '<p class="lede">Deaths under age one per 1,000 live births, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-infant" role="img" aria-label="Chart of infant mortality 2019 to 2025"></canvas>'
    + sourceLine(['infantMortality']) + '</section>'
    + '</div>'
    + '<section class="card" style="margin-top:16px"><h2>Health system by year</h2>'
    + seriesTable(['beds', 'doctors'], state.year)
    + sourceLine(['beds', 'doctors'])
    + '<p>Nusaraya has 412 hospitals and 1,860 clinics. Public health spending was 4.1% of GDP in 2025. Source: NSO Health Facilities Register 2025.</p>'
    + '</section>';
  wireControls(root, update);
  drawSeriesChart(root.querySelector('#chart-life'), 'lifeExpectancy', state);
  drawSeriesChart(root.querySelector('#chart-infant'), 'infantMortality', state);
}

// ---------------- Education ----------------

export function renderEducation(root, state, update) {
  root.innerHTML = '<div class="page-head"><h1>Education</h1>'
    + '<p>Reading, schooling and enrolment in Nusaraya. Compulsory schooling runs from age 6 to age 15.</p></div>'
    + '<div class="controls">' + yearSelect(state, update) + chartToggle(state, update) + '</div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>Adult literacy rate</h2>'
    + '<p class="lede">Percent of people aged 15 and over who can read and write, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-lit" role="img" aria-label="Chart of adult literacy 2019 to 2025"></canvas>'
    + sourceLine(['literacy']) + '</section>'
    + '<section class="card"><h2>Mean years of schooling</h2>'
    + '<p class="lede">Population aged 25 and over, years, 2019–2025.</p>'
    + '<canvas class="chart" id="chart-school" role="img" aria-label="Chart of mean years of schooling 2019 to 2025"></canvas>'
    + sourceLine(['schooling']) + '</section>'
    + '</div>'
    + '<section class="card" style="margin-top:16px"><h2>Education by year</h2>'
    + seriesTable(['literacy', 'schooling', 'enrolment'], state.year)
    + sourceLine(['literacy', 'schooling', 'enrolment'])
    + '<p>Tertiary enrolment reached 41.2% of 18–22 year olds in 2025. There are 96 universities and 214 colleges. Source: NSO Education Statistics 2025.</p>'
    + '</section>';
  wireControls(root, update);
  drawSeriesChart(root.querySelector('#chart-lit'), 'literacy', state);
  drawSeriesChart(root.querySelector('#chart-school'), 'schooling', state);
}

// ---------------- Regions ----------------

export function renderRegions(root, state, update) {
  const selected = state.region === 'all' ? null : PROVINCES.find((p) => p.name === state.region);
  const query = (state.query || '').toLowerCase();
  const filtered = PROVINCES.filter((p) => !query || p.name.toLowerCase().includes(query) || p.capital.toLowerCase().includes(query));
  const shown = selected ? [selected] : filtered;

  root.innerHTML = '<div class="page-head"><h1>Regions</h1>'
    + '<p>All 8 provinces of Nusaraya, compared on population, income, jobs, literacy and health. Click a column heading to sort; click a province name for its detail.</p></div>'
    + '<div class="controls">'
    + '<label for="region-search">Search provinces</label>'
    + '<input type="search" id="region-search" data-control="query" placeholder="Province or capital city…" value="' + escapeHtml(state.query || '') + '">'
    + '<label for="region-pick">Province</label>'
    + '<select id="region-pick" data-control="region">'
    + '<option value="all"' + (state.region === 'all' ? ' selected' : '') + '>All provinces</option>'
    + PROVINCES.map((p) => '<option value="' + p.name + '"' + (p.name === state.region ? ' selected' : '') + '>' + p.name + '</option>').join('')
    + '</select>'
    + '<button class="btn" type="button" id="csv-btn">Download CSV</button>'
    + '</div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>Population by province, 2025</h2>'
    + '<p class="lede">Millions of people. Pesisir Utara is the largest province; Padang Utara the smallest.</p>'
    + '<canvas class="chart" id="chart-provinces" role="img" aria-label="Bar chart of population by province in 2025"></canvas>'
    + '<p class="source-note">Source: NSO Population Estimates 2025.</p></section>'
    + '<section class="card"><h2>Province table, 2025</h2>'
    + '<p class="lede" id="table-count">' + shown.length + ' of 8 provinces shown.</p>'
    + '<table class="data" id="province-table"><caption>Provinces ranked by population</caption>'
    + '<thead><tr><th data-sort="name">Province</th><th data-sort="population">People (m)</th><th data-sort="gdpPerCapita">GDP per person (NRD)</th><th data-sort="unemployment">Unemployment (%)</th><th data-sort="literacy">Literacy (%)</th></tr></thead>'
    + '<tbody id="province-rows"></tbody></table>'
    + '<p class="source-note">Source: NSO Regional Statistics 2025.</p></section>'
    + '</div>'
    + '<div id="province-detail"></div>';

  function renderRows(rows) {
    root.querySelector('#province-rows').innerHTML = rows.map((p) => '<tr><td><a href="#/regions" data-province="' + p.name + '">' + p.name + '</a></td><td>' + fmt(p.population, 2) + '</td><td>' + p.gdpPerCapita.toLocaleString('en-US') + '</td><td>' + fmt(p.unemployment) + '</td><td>' + fmt(p.literacy) + '</td></tr>').join('')
      || '<tr><td colspan="5">No province matches that search.</td></tr>';
    root.querySelector('#table-count').textContent = rows.length + ' of 8 provinces shown.';
    root.querySelectorAll('[data-province]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        update({ region: link.getAttribute('data-province') });
      });
    });
  }
  renderRows(shown);
  makeSortable(root.querySelector('#province-table'), shown, renderRows);

  root.querySelector('[data-control="query"]').addEventListener('input', (event) => {
    update({ query: event.target.value, region: 'all' });
    const input = root.querySelector('[data-control="query"]');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
  root.querySelector('[data-control="region"]').addEventListener('change', (event) => {
    update({ region: event.target.value });
  });
  root.querySelector('#csv-btn').addEventListener('click', () => {
    downloadCSV('nusaraya-provinces-2025.csv',
      ['Province', 'Capital', 'Population (millions)', 'GDP per person (NRD)', 'Unemployment (%)', 'Literacy (%)', 'Life expectancy (years)'],
      PROVINCES.map((p) => [p.name, p.capital, p.population, p.gdpPerCapita, p.unemployment, p.literacy, p.lifeExpectancy]));
  });

  drawHorizontalBars(root.querySelector('#chart-provinces'),
    [...PROVINCES].sort((a, b) => b.population - a.population)
      .map((p) => ({ label: p.name, value: p.population, valueText: fmt(p.population, 2) + 'm' })));

  if (selected) {
    const share = (selected.population / SERIES.population.values[6]) * 100;
    root.querySelector('#province-detail').innerHTML = '<section class="card detail-box"><h3>' + selected.name + ' — province detail, 2025</h3>'
      + '<dl class="facts">'
      + '<dt>Capital</dt><dd>' + selected.capital + '</dd>'
      + '<dt>Population</dt><dd>' + fmt(selected.population, 2) + ' million (' + fmt(share) + '% of Nusaraya)</dd>'
      + '<dt>GDP per person</dt><dd>' + selected.gdpPerCapita.toLocaleString('en-US') + ' NRD</dd>'
      + '<dt>Unemployment</dt><dd>' + fmt(selected.unemployment) + '%</dd>'
      + '<dt>Adult literacy</dt><dd>' + fmt(selected.literacy) + '%</dd>'
      + '<dt>Life expectancy</dt><dd>' + fmt(selected.lifeExpectancy) + ' years</dd>'
      + '</dl><p class="source-note">Source: NSO Regional Statistics 2025.</p>'
      + '<p><button class="btn ghost" type="button" id="clear-province">Show all provinces</button></p></section>';
    root.querySelector('#clear-province').addEventListener('click', () => update({ region: 'all' }));
  }
  wireControls(root, update);
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------------- Methodology & About ----------------

export function renderMethodology(root) {
  root.innerHTML = '<div class="page-head"><h1>Methodology &amp; about</h1>'
    + '<p>How the Nusaraya Statistics Office collects, checks and publishes the numbers on this site.</p></div>'
    + '<div class="grid two">'
    + '<section class="card"><h2>About the NSO</h2>'
    + '<p>The Nusaraya Statistics Office was founded in ' + ABOUT.founded + ' and employs ' + ABOUT.staff.toLocaleString('en-US')
    + ' people in ' + ABOUT.offices + '. It is the official source of statistics for the Republic of Nusaraya and publishes '
    + 'figures free of charge for everyone to use, with the source named.</p>'
    + '<p>' + ABOUT.census + '</p>'
    + '<h3>How the numbers are made</h3>'
    + '<ul class="method-list">'
    + '<li><strong>Census and registers.</strong> The 2020 census counted every household; population estimates between censuses use birth, death and migration registers.</li>'
    + '<li><strong>Surveys.</strong> The Labour Force Survey interviews 42,000 households each quarter; the Household Budget Survey covers 18,000 households a year.</li>'
    + '<li><strong>Administrative data.</strong> Tax, school, hospital and business registers supply most economic and social figures, checked against survey results.</li>'
    + '<li><strong>Revisions.</strong> Figures are revised when better data arrive; every revision is dated and the previous value stays visible in the archive.</li>'
    + '<li><strong>Quality.</strong> Each release passes range checks, comparison with the previous period, and a second analyst review before publication.</li>'
    + '</ul></section>'
    + '<section class="card"><h2>Release calendar</h2>'
    + '<p class="lede">When the next edition of each release is due.</p>'
    + '<table class="data"><thead><tr><th>Release</th><th>Frequency</th><th>Next due</th></tr></thead><tbody>'
    + CALENDAR.map((c) => '<tr><td>' + c.release + '</td><td>' + c.frequency + '</td><td>' + c.next + '</td></tr>').join('')
    + '</tbody></table>'
    + '<h3 style="margin-top:18px">Definitions</h3>'
    + '<dl class="facts">'
    + '<dt>Unemployed</dt><dd>A person without work, available to start within two weeks, and actively looking in the past four weeks.</dd>'
    + '<dt>GDP</dt><dd>The market value of all goods and services produced in Nusaraya in a year.</dd>'
    + '<dt>Inflation</dt><dd>The yearly change in the consumer price index, based on a basket of 412 goods and services.</dd>'
    + '<dt>Literacy</dt><dd>The share of people aged 15 and over who can read and write a short, simple statement.</dd>'
    + '</dl></section></div>'
    + '<section class="card" style="margin-top:16px"><h2>Using these statistics</h2>'
    + '<p>All figures on this site may be reused with attribution to the Nusaraya Statistics Office and the release named. '
    + 'Download province data as CSV from the Regions page. For questions, write to the NSO at statistics office, 1 Merdeka Square, Bandar Raya.</p>'
    + '<p class="source-note">This is a demonstration site with invented figures for a fictional country. No figure here describes a real place.</p>'
    + '</section>';
}
