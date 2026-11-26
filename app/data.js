// Statistics for the fictional Republic of Nusaraya.
// Every figure is labelled with its source and year where it is shown.
// All values are invented for this demonstration site; none describe a
// real country. Years run 2019-2025 unless a table says otherwise.

export const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const COUNTRY = {
  name: 'Nusaraya',
  fullName: 'Republic of Nusaraya',
  office: 'Nusaraya Statistics Office',
  officeShort: 'NSO',
  capital: 'Bandar Raya',
  currency: 'Nusaraya dollar (NRD)',
  areaKm2: 412800,
  provinces: 8,
  districts: 96,
};

// National series, one value per year in YEARS order.
export const SERIES = {
  population: { // millions, mid-year estimate
    label: 'Population',
    unit: 'million people',
    values: [46.10, 46.58, 47.03, 47.51, 47.96, 48.29, 48.62],
    source: 'NSO Population Estimates 2025',
  },
  gdp: { // billion NRD, current prices
    label: 'Gross domestic product',
    unit: 'billion NRD',
    values: [412, 398, 421, 448, 472, 496, 521],
    source: 'NSO National Accounts 2025',
  },
  gdpGrowth: { // percent, year on year, constant prices
    label: 'GDP growth',
    unit: 'percent',
    values: [4.1, -3.4, 5.8, 6.4, 5.4, 5.1, 5.0],
    source: 'NSO National Accounts 2025',
  },
  inflation: { // consumer prices, percent
    label: 'Inflation (CPI)',
    unit: 'percent',
    values: [2.4, 1.8, 2.9, 4.6, 3.2, 2.7, 2.5],
    source: 'NSO Consumer Price Index, December 2025',
  },
  unemployment: { // percent of labour force
    label: 'Unemployment rate',
    unit: 'percent',
    values: [5.8, 7.9, 6.8, 6.1, 5.6, 5.3, 5.1],
    source: 'NSO Labour Force Survey 2025',
  },
  participation: { // labour force participation, percent of working-age population
    label: 'Labour force participation',
    unit: 'percent',
    values: [68.4, 66.1, 67.3, 68.0, 68.9, 69.4, 69.8],
    source: 'NSO Labour Force Survey 2025',
  },
  lifeExpectancy: { // years at birth
    label: 'Life expectancy at birth',
    unit: 'years',
    values: [71.2, 71.0, 71.8, 72.6, 73.3, 73.8, 74.1],
    source: 'NSO Vital Statistics 2025',
  },
  infantMortality: { // deaths under age one per 1,000 live births
    label: 'Infant mortality',
    unit: 'per 1,000 live births',
    values: [14.2, 13.6, 12.9, 12.1, 11.3, 10.4, 9.8],
    source: 'NSO Vital Statistics 2025',
  },
  literacy: { // percent of population aged 15 and over
    label: 'Adult literacy rate',
    unit: 'percent',
    values: [94.8, 95.2, 95.6, 96.1, 96.5, 96.8, 97.1],
    source: 'NSO Education Statistics 2025',
  },
  schooling: { // mean years of schooling, population aged 25 and over
    label: 'Mean years of schooling',
    unit: 'years',
    values: [9.8, 9.9, 10.2, 10.5, 10.8, 11.0, 11.2],
    source: 'NSO Education Statistics 2025',
  },
  enrolment: { // net primary enrolment, percent
    label: 'Net primary enrolment',
    unit: 'percent',
    values: [96.4, 96.1, 96.8, 97.5, 98.0, 98.3, 98.6],
    source: 'NSO Education Statistics 2025',
  },
  beds: { // hospital beds per 10,000 people
    label: 'Hospital beds',
    unit: 'per 10,000 people',
    values: [18.2, 19.1, 19.8, 20.4, 21.0, 21.6, 22.1],
    source: 'NSO Health Facilities Register 2025',
  },
  doctors: { // physicians per 10,000 people
    label: 'Physicians',
    unit: 'per 10,000 people',
    values: [9.4, 9.8, 10.3, 10.9, 11.4, 11.9, 12.3],
    source: 'NSO Health Facilities Register 2025',
  },
};

// Employment shares by sector, percent of total employment, 2025.
export const SECTORS = [
  { name: 'Agriculture, forestry and fishing', share: 27.6, workers: 6.42 },
  { name: 'Manufacturing', share: 16.8, workers: 3.91 },
  { name: 'Construction', share: 7.4, workers: 1.72 },
  { name: 'Trade, hotels and restaurants', share: 19.3, workers: 4.49 },
  { name: 'Transport and communications', share: 8.1, workers: 1.88 },
  { name: 'Finance and business services', share: 6.2, workers: 1.44 },
  { name: 'Public services and education', share: 14.6, workers: 3.40 },
];

// GDP shares by industry, percent of GDP, 2025.
export const GDP_SHARES = [
  { name: 'Agriculture', share: 11.8 },
  { name: 'Mining and quarrying', share: 6.4 },
  { name: 'Manufacturing', share: 21.5 },
  { name: 'Electricity, gas and water', share: 2.1 },
  { name: 'Construction', share: 9.6 },
  { name: 'Trade and hospitality', share: 16.2 },
  { name: 'Transport and communications', share: 8.9 },
  { name: 'Finance and insurance', share: 7.8 },
  { name: 'Other services', share: 15.7 },
];

// Age structure, percent of population, 2025.
export const AGE_GROUPS = [
  { group: '0–14 years', share: 24.1 },
  { group: '15–24 years', share: 16.8 },
  { group: '25–54 years', share: 41.3 },
  { group: '55–64 years', share: 10.2 },
  { group: '65 years and over', share: 7.6 },
];

// Provinces, 2025. Populations sum to the national total of 48.62 million.
export const PROVINCES = [
  { name: 'Pesisir Utara', capital: 'Kota Pelabuhan', population: 9.84, gdpPerCapita: 13240, unemployment: 4.6, literacy: 98.0, lifeExpectancy: 75.2 },
  { name: 'Dataran Tengah', capital: 'Kota Tengah', population: 8.21, gdpPerCapita: 11870, unemployment: 5.0, literacy: 97.6, lifeExpectancy: 74.8 },
  { name: 'Lembah Timur', capital: 'Timur Jaya', population: 7.45, gdpPerCapita: 10150, unemployment: 5.4, literacy: 96.9, lifeExpectancy: 74.0 },
  { name: 'Kepulauan Selatan', capital: 'Pulau Damai', population: 6.02, gdpPerCapita: 9460, unemployment: 5.8, literacy: 96.4, lifeExpectancy: 73.5 },
  { name: 'Bukit Barat', capital: 'Bukit Indah', population: 5.67, gdpPerCapita: 8930, unemployment: 5.2, literacy: 96.8, lifeExpectancy: 73.9 },
  { name: 'Teluk Biru', capital: 'Teluk Kota', population: 4.38, gdpPerCapita: 10480, unemployment: 4.9, literacy: 97.3, lifeExpectancy: 74.4 },
  { name: 'Hutan Rimba', capital: 'Rimba Baru', population: 3.91, gdpPerCapita: 7820, unemployment: 6.1, literacy: 95.1, lifeExpectancy: 72.6 },
  { name: 'Padang Utara', capital: 'Padang Kota', population: 3.14, gdpPerCapita: 8410, unemployment: 5.7, literacy: 95.8, lifeExpectancy: 73.1 },
];

// Latest releases shown on the dashboard.
export const RELEASES = [
  { date: '2025-11-20', title: 'Labour Force Survey, third quarter 2025', note: 'Unemployment fell to 5.1%, the lowest since 2019.' },
  { date: '2025-11-12', title: 'Consumer Price Index, October 2025', note: 'Annual inflation eased to 2.5% from 2.7% in September.' },
  { date: '2025-10-28', title: 'National Accounts, third quarter 2025', note: 'GDP grew 5.0% year on year; services led the expansion.' },
  { date: '2025-10-15', title: 'Population Estimates 2025', note: 'Mid-year population reached 48.62 million.' },
  { date: '2025-09-30', title: 'Education Statistics 2025', note: 'Adult literacy reached 97.1%; mean schooling 11.2 years.' },
  { date: '2025-09-18', title: 'Vital Statistics 2025', note: 'Life expectancy reached 74.1 years; infant mortality 9.8 per 1,000.' },
];

// Release calendar for the methodology page.
export const CALENDAR = [
  { release: 'Consumer Price Index', frequency: 'Monthly', next: '2025-12-10' },
  { release: 'Labour Force Survey', frequency: 'Quarterly', next: '2026-02-19' },
  { release: 'National Accounts (GDP)', frequency: 'Quarterly', next: '2026-02-05' },
  { release: 'Population Estimates', frequency: 'Annual', next: '2026-10-15' },
  { release: 'Vital Statistics', frequency: 'Annual', next: '2026-09-18' },
  { release: 'Education Statistics', frequency: 'Annual', next: '2026-09-30' },
  { release: 'Regional Statistics', frequency: 'Annual', next: '2026-11-02' },
];

// Key facts for the About section.
export const ABOUT = {
  founded: 1962,
  staff: 1240,
  offices: '8 provincial offices and 96 district offices',
  census: 'The last full census was in 2020; the next is planned for 2030.',
};
