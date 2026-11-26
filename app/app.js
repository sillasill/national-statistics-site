// Router and shared state for the Nusaraya Statistics Office site.
// Hash routes: #/ dashboard, #/population, #/economy, #/labour,
// #/health, #/education, #/regions, #/methodology.
// State (reference year, chart type, selected province, search text)
// is kept in one object; update() merges a patch and re-renders.

import {
  renderDashboard,
  renderPopulation,
  renderEconomy,
  renderLabour,
  renderHealth,
  renderEducation,
  renderRegions,
  renderMethodology,
} from './pages.js';

const ROUTES = {
  '': renderDashboard,
  population: renderPopulation,
  economy: renderEconomy,
  labour: renderLabour,
  health: renderHealth,
  education: renderEducation,
  regions: renderRegions,
  methodology: renderMethodology,
};

const state = {
  year: 2025,
  chart: 'line',
  region: 'all',
  query: '',
};

const view = document.getElementById('view');
const navLinks = [...document.querySelectorAll('#nav-list a')];

function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return ROUTES[hash] ? hash : '';
}

function update(patch) {
  Object.assign(state, patch);
  render();
}

function render() {
  const route = currentRoute();
  const renderPage = ROUTES[route];
  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('data-route') === route);
  });
  renderPage(view, state, update);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', render);
window.addEventListener('resize', () => {
  // Redraw the charts at the new width; cheap and keeps them crisp.
  render();
});

render();
