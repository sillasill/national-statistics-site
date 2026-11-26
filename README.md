# National Statistics Site — Republic of Nusaraya

A working national statistics site for the fictional Republic of Nusaraya, published by its fictional Nusaraya Statistics Office (NSO). Dashboard, population, economy, labour, health, education, regions and methodology pages, all reachable by links, with charts, sortable tables, search, year and chart-type controls, and CSV download — running entirely from static files with no network requests.

[![make.fun](https://make.fun/badge/best-national-statistics-site-20261126-0539.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![Rank](https://make.fun/badge/best-national-statistics-site-20261126-0539/sillasill/national-statistics-site/rank.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)
[![Reward](https://make.fun/badge/best-national-statistics-site-20261126-0539/sillasill/national-statistics-site/reward.svg)](https://make.fun/bounty/best-national-statistics-site-20261126-0539)

Bounty: https://make.fun/bounty/best-national-statistics-site-20261126-0539

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
python3 -m http.server 8080 --directory app
```

## Layout

- `app/index.html` — page shell, navigation, footer
- `app/style.css` — the site's visual identity
- `app/data.js` — all statistics (population, economy, labour, health, education, provinces), each labelled with source and year
- `app/charts.js` — canvas chart helpers (line, bar, donut, horizontal bars)
- `app/pages.js` — one render function per page, sortable tables, CSV download
- `app/app.js` — hash router and shared state
- `main.ts` — hand-in program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`
- `screenshots/` — screenshots of the site running in a browser

All figures are invented for a fictional country; no figure describes a real place.
