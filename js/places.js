// Cities on the route, with coordinates from the Kensington quote API, plus
// coarse country outlines for the offline map. The outlines are hand-traced
// at roughly 1° resolution: recognisable at phone size, never for navigation.

export const cities = [
  { id: 'hanoi', name: 'Hanoi', country: 'Vietnam', lat: 21.0227, lon: 105.8501, days: [1, 2, 3], hotel: 'Oriental Jade Hotel' },
  { id: 'halong', name: 'Halong Bay', country: 'Vietnam', lat: 20.9, lon: 107.2, days: [4, 5], hotel: 'Lyra Grandeur Cruise' },
  { id: 'hcmc', name: 'Ho Chi Minh City', country: 'Vietnam', lat: 10.75, lon: 106.6667, days: [6, 7], hotel: 'Caravelle Saigon' },
  { id: 'siemreap', name: 'Siem Reap', country: 'Cambodia', lat: 13.3622, lon: 103.8597, days: [8, 9, 10], hotel: 'Jaya House River Park' },
  { id: 'chiangmai', name: 'Chiang Mai', country: 'Thailand', lat: 18.7889, lon: 98.9833, days: [11, 12, 13], hotel: 'Amanor Hotel Chiang Mai' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', lat: 13.75, lon: 100.4833, days: [14, 15, 16], hotel: 'Avani+ Riverside Bangkok Hotel' },
];

// Legs in travel order. mode: 'road' | 'boat' | 'air'. `via` is a stop with no overnight.
export const legs = [
  { from: 'hanoi', to: 'halong', mode: 'road', day: 4 },
  { from: 'halong', to: 'hanoi', mode: 'road', day: 6 },
  { from: 'hanoi', to: 'hcmc', mode: 'air', day: 6 },
  { from: 'hcmc', to: 'siemreap', mode: 'air', day: 8 },
  { from: 'siemreap', to: 'bangkok', mode: 'air', day: 11, via: true },
  { from: 'bangkok', to: 'chiangmai', mode: 'air', day: 11 },
  { from: 'chiangmai', to: 'bangkok', mode: 'air', day: 14 },
];

// [lat, lon] rings. Coarse on purpose.
export const outlines = {
  vietnam: [
    [23.3, 105.4], [22.8, 106.6], [21.6, 107.9], [21.5, 108.0], [20.9, 106.8], [20.2, 106.5], [19.8, 105.8],
    [18.7, 105.7], [17.9, 106.4], [17.1, 107.1], [16.5, 107.6], [16.1, 108.2], [15.4, 108.9], [14.5, 109.1],
    [13.8, 109.3], [12.7, 109.4], [12.2, 109.2], [11.4, 108.9], [10.9, 108.1], [10.4, 107.1], [10.2, 106.7],
    [9.5, 106.4], [8.6, 105.0], [8.6, 104.7], [9.3, 104.8], [10.0, 104.9], [10.4, 104.5], [10.9, 105.9],
    [11.6, 106.0], [11.9, 106.5], [12.2, 107.5], [13.5, 107.5], [14.5, 107.5], [15.5, 107.2], [16.1, 106.6],
    [17.0, 106.5], [17.6, 105.6], [18.5, 105.2], [19.3, 104.2], [20.4, 104.6], [21.0, 103.0], [22.4, 102.1],
    [22.8, 103.3], [23.3, 105.4],
  ],
  cambodia: [
    [14.4, 102.5], [14.4, 103.5], [14.4, 105.2], [14.7, 106.1], [14.5, 107.5], [13.5, 107.5], [12.2, 107.5],
    [11.9, 106.5], [11.6, 106.0], [10.9, 105.9], [10.4, 104.5], [10.6, 104.2], [10.6, 103.5], [11.0, 103.1],
    [11.6, 103.0], [12.2, 102.7], [13.6, 102.4], [14.4, 102.5],
  ],
  thailand: [
    [20.4, 99.9], [20.2, 100.5], [19.6, 101.2], [18.0, 101.1], [17.9, 102.1], [18.0, 103.0], [17.4, 104.7],
    [16.0, 105.5], [15.3, 105.6], [14.4, 105.2], [14.4, 103.5], [14.4, 102.5], [13.6, 102.4], [12.2, 102.7],
    [11.7, 102.9], [12.6, 102.1], [12.9, 100.9], [13.5, 100.5], [13.3, 100.1], [12.6, 99.95], [11.8, 99.8],
    [10.5, 99.2], [9.1, 99.3], [8.5, 100.0], [7.2, 100.6], [6.5, 101.5], [6.0, 101.1], [6.6, 100.1],
    [7.5, 99.3], [8.0, 98.3], [9.0, 98.3], [10.0, 98.6], [11.0, 99.0], [12.0, 99.2], [13.0, 99.2],
    [14.5, 98.3], [15.3, 98.6], [16.5, 98.5], [17.5, 97.8], [18.5, 97.5], [19.5, 97.9], [20.4, 99.9],
  ],
  laos: [
    [22.4, 102.1], [21.0, 103.0], [20.4, 104.6], [19.3, 104.2], [18.5, 105.2], [17.6, 105.6], [17.0, 106.5],
    [16.1, 106.6], [15.5, 107.2], [14.5, 107.5], [14.7, 106.1], [14.4, 105.2], [15.3, 105.6], [16.0, 105.5],
    [17.4, 104.7], [18.0, 103.0], [17.9, 102.1], [18.0, 101.1], [19.6, 101.2], [20.2, 100.5], [20.4, 99.9],
    [21.2, 100.4], [21.5, 101.2], [22.4, 102.1],
  ],
};
