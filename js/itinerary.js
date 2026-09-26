// The trip, day by day, transcribed from the Kensington Tours quote
// (clients.kensingtontours.com/quote/4976169Hic2). This file is the only
// place trip facts live. Edit here; nothing else in the app knows a date.
//
// Every stop on this trip (Vietnam, Cambodia, Thailand) is UTC+7, so one
// time zone covers the whole itinerary. See js/clock.js for how "today" is
// worked out from it.

export const trip = {
  name: 'Vietnam, Cambodia & Thailand',
  travelers: 'Mom & Dad',
  start: '2027-01-27',
  end: '2027-02-11',
  timeZone: 'Asia/Bangkok',
  operator: {
    name: 'Kensington Tours',
    expert: 'Garland',
    phone: '1 888 903 2001 x4144',
    note: '24/7 in-destination support is included; the local office number is in your travel documents.',
  },
};

// step.kind is one of: arrive | transfer | flight | tour | cruise | hotel | depart
// step.time is only set when the itinerary gives one.
export const days = [
  {
    n: 1,
    date: '2027-01-27',
    place: 'Hanoi',
    country: 'Vietnam',
    title: 'The Adventure Begins',
    route: null,
    steps: [
      { kind: 'arrive', title: 'Arrive Hanoi (Noi Bai Airport)', detail: 'VIP fast-track meet & greet with visa. A hostess will be holding a sign with your name.' },
      { kind: 'transfer', title: 'Private transfer to hotel', detail: 'Driver and English-speaking guide.' },
      { kind: 'hotel', title: 'Check in: Oriental Jade Hotel', detail: 'Sapphire Old Quarter View room, breakfast included.' },
    ],
    hotel: { name: 'Oriental Jade Hotel', room: 'Sapphire Old Quarter View with Breakfast', nights: 3 },
    notes: [
      'Bring a printed color copy of your eVisa. Immigration will need to see it.',
      'Look for the hostess with your name on a sign; she walks you through fast-track security and to your guide.',
    ],
    body: [
      'Welcome to Vietnam. Upon arrival at Hanoi\'s Noi Bai International Airport you will be welcomed by a hostess holding a sign with your name on it. She will guide you through fast-track security and, after your visa is stamped and your luggage collected, lead you to your waiting guide and vehicle.',
      'You will be privately transferred to your hotel by a professional driver and an English-speaking guide.',
    ],
  },
  {
    n: 2,
    date: '2027-01-28',
    place: 'Hanoi',
    country: 'Vietnam',
    title: 'See the Signature Sights in Style',
    route: null,
    steps: [
      { kind: 'tour', title: 'Half-day Hanoi War Tour', duration: '3.5 hrs', detail: 'Private vehicle, guide and driver. National Museum of History, Hoa Lo Prison, West Lake and Truc Bach Lake, coffee by the lake.' },
      { kind: 'hotel', title: 'Oriental Jade Hotel', detail: 'Night 2 of 3.' },
    ],
    hotel: { name: 'Oriental Jade Hotel', room: 'Sapphire Old Quarter View with Breakfast', nights: 3 },
    notes: [],
    body: [
      'Meet your private guide and depart your hotel for a half-day exploration of Hanoi\'s wartime history. Begin at the Vietnam National Museum of History, where artifacts spanning centuries give context to the First and Second Indochina Wars.',
      'Continue to Hoa Lo Prison, once known as the "Hanoi Hilton", for a powerful look at life behind its walls and insight into both Vietnamese political prisoners and American POWs.',
      'From there, journey to the shores of West Lake and Truc Bach Lake, where a memorial marks the capture of Senator John McCain in 1967. Conclude with a relaxed coffee overlooking the lake.',
    ],
  },
  {
    n: 3,
    date: '2027-01-29',
    place: 'Hanoi',
    country: 'Vietnam',
    title: 'Pottery Village & Street Food',
    route: null,
    steps: [
      { kind: 'tour', title: 'Bat Trang Pottery Village', duration: '3 hrs', detail: 'Private vehicle, driver and guide. About 15 km outside Hanoi.' },
      { kind: 'tour', title: 'Evening Street Food Tour', duration: '3 hrs', time: 'Evening', detail: 'Private, on foot from your hotel through the Old Quarter.' },
      { kind: 'hotel', title: 'Oriental Jade Hotel', detail: 'Night 3 of 3.' },
    ],
    hotel: { name: 'Oriental Jade Hotel', room: 'Sapphire Old Quarter View with Breakfast', nights: 3 },
    notes: ['Come hungry for the evening: pho, banh cuon, Vietnamese coffee, and a beer at Ta Hien corner are all on the route.'],
    body: [
      'Today you will be taken to the Bat Trang Pottery Village, about 15 kilometers outside Hanoi and surrounded by farmland. Watch the artisans forming, painting and glazing their pieces, which are then fired for several days in huge kilns.',
      'In the evening, your private English-speaking guide meets you at your hotel and walks with you to Hoan Kiem Lake to start your culinary journey. Stroll down Hang Gai "silk" street, past St. Joseph Cathedral to Cafe Nhan for traditional Vietnamese coffee with condensed milk.',
      'Queue up at Pho Bat Dan, a local favorite for steaming bowls of noodle soup. Leave room for banh cuon on Hang Ga street, a rice noodle roll filled with seasoned pork, wood ear mushrooms and shallots. Pull up a seat at a street-side stall for nom bo kho, a dried beef salad with kohlrabi, mango, coconut and chili. End the evening at Ta Hien beer corner with a cold draught beer.',
    ],
  },
  {
    n: 4,
    date: '2027-01-30',
    place: 'Halong Bay',
    country: 'Vietnam',
    title: 'All Aboard!',
    route: 'Hanoi to Halong Bay',
    steps: [
      { kind: 'transfer', title: 'Private drive Hanoi to Halong Bay', duration: '3 hrs', detail: 'Driver and English-speaking guide.' },
      { kind: 'cruise', title: 'Board Lyra Grandeur Cruise', detail: 'Capella Cruises. All excursions and meals included.' },
      { kind: 'hotel', title: 'Harmony Suite, Lyra Grandeur', detail: 'Night 1 of 2 on board. Breakfast, lunch and dinner included.' },
    ],
    hotel: { name: 'Lyra Grandeur Cruise', room: 'Harmony Suite, all meals included', nights: 2 },
    notes: ['Pack a small overnight bag for the boat if you would rather leave the big suitcases in the vehicle. Ask your guide.'],
    body: [
      'You will be privately transferred from Hanoi to Halong Bay by a professional driver and an English-speaking guide. Approximate travel time is 3 hours.',
      'Enjoy time at leisure to explore at your own pace, or relax on your ship. Lyra Cruise has 33 cabins, each with floor-to-ceiling windows and a private balcony looking out on the limestone mountains.',
    ],
  },
  {
    n: 5,
    date: '2027-01-31',
    place: 'Halong Bay',
    country: 'Vietnam',
    title: 'A Day on the Bay',
    route: null,
    steps: [
      { kind: 'cruise', title: 'Cruising Halong Bay', detail: 'All excursions and meals included. Follow the ship\'s daily program.' },
      { kind: 'hotel', title: 'Harmony Suite, Lyra Grandeur', detail: 'Night 2 of 2 on board.' },
    ],
    hotel: { name: 'Lyra Grandeur Cruise', room: 'Harmony Suite, all meals included', nights: 2 },
    notes: [],
    body: [
      'Enjoy time at leisure to explore at your own pace, or relax on your ship. Emerald water, cave formations and green islands all day long.',
    ],
  },
  {
    n: 6,
    date: '2027-02-01',
    place: 'Ho Chi Minh City',
    country: 'Vietnam',
    title: 'A Change of Scenery',
    route: 'Halong Bay to Hanoi to Ho Chi Minh City',
    steps: [
      { kind: 'transfer', title: 'Private drive Halong Bay to Hanoi Airport', duration: '3 hrs', detail: 'Driver and English-speaking guide.' },
      { kind: 'flight', title: 'Fly Hanoi to Ho Chi Minh City', duration: '2 hrs', detail: 'Direct, economy.' },
      { kind: 'transfer', title: 'Private transfer to hotel', detail: 'Driver and English-speaking guide.' },
      { kind: 'hotel', title: 'Check in: Caravelle Saigon', detail: 'Signature Room, breakfast included.' },
    ],
    hotel: { name: 'Caravelle Saigon', room: 'Signature Room with Breakfast', nights: 2 },
    notes: ['Long travel day: three hours by road, then a two-hour flight. Keep passports handy.'],
    body: [
      'You will be privately transferred from Halong Bay to Hanoi by a professional driver and an English-speaking guide. Approximate travel time is three hours.',
      'Board a flight from Hanoi with direct service to Ho Chi Minh City. Approximate flight time is two hours. On arrival you will be privately transferred to your hotel.',
      'Caravelle Saigon has been a landmark in the city center since 1959, a short walk from the Saigon Opera House, Notre Dame Cathedral and Ben Thanh Market.',
    ],
  },
  {
    n: 7,
    date: '2027-02-02',
    place: 'Ho Chi Minh City',
    country: 'Vietnam',
    title: 'Sights and Insights',
    route: null,
    steps: [
      { kind: 'tour', title: 'Vinh Long Mekong Delta', duration: '9 hrs', time: 'Morning', detail: 'Private tour with lunch. Sampan cruise from Cai Be jetty, lunch at Le Longanier.' },
      { kind: 'hotel', title: 'Caravelle Saigon', detail: 'Night 2 of 2.' },
    ],
    hotel: { name: 'Caravelle Saigon', room: 'Signature Room with Breakfast', nights: 2 },
    notes: ['Full day out. Sun hat, sunscreen and comfortable shoes for the canal walk.'],
    body: [
      'The mighty Mekong River is the lifeblood of Vietnam and its neighbors, winding across Southeast Asia for over 2,700 miles before reaching its delta on the outskirts of Ho Chi Minh City.',
      'This morning, meet your guide in the hotel lobby and transfer to the Cai Be jetty. Your crew welcomes you with cold towels and a drink while your Cai Be Princess sampan sets off on a leisurely cruise of the busy waterways. Stops along the way show local micro-industries: coconut candy and puffed rice.',
      'Your cruise ends at Le Longanier Restaurant, a colonial-style villa in a tropical garden by the river, for lunch. Afterward, a short walk along the canal to the Ba Bon Bridge, where your vehicle waits to drive you back to the city.',
    ],
  },
  {
    n: 8,
    date: '2027-02-03',
    place: 'Siem Reap',
    country: 'Cambodia',
    title: 'Angkor is Calling!',
    route: 'Ho Chi Minh City to Siem Reap',
    steps: [
      { kind: 'transfer', title: 'Private transfer to Ho Chi Minh Airport', detail: 'Driver and English-speaking guide.' },
      { kind: 'flight', title: 'Fly Ho Chi Minh City to Siem Reap', duration: '1 hr', detail: 'Direct, economy.' },
      { kind: 'arrive', title: 'Arrive Cambodia', detail: 'VIP fast-track immigration and visa service. An escort with a signboard meets you at the plane.' },
      { kind: 'transfer', title: 'Private transfer to hotel', detail: 'Driver and English-speaking guide.' },
      { kind: 'hotel', title: 'Check in: Jaya House River Park', detail: 'Deluxe Room, breakfast included.' },
    ],
    hotel: { name: 'Jaya House River Park', room: 'Deluxe Room with Breakfast', nights: 3 },
    notes: ['New country today. Your escort handles the Cambodia visa on arrival.', 'Tomorrow starts at 5:00 am for sunrise at Angkor Wat. Set an alarm and lay out clothes tonight.'],
    body: [
      'You will be privately transferred to Ho Chi Minh Airport, then board a direct flight to Siem Reap, Cambodia. Approximate flight time is one hour.',
      'Upon arrival in Siem Reap, you will be welcomed by an escort holding a signboard with your name. Your escort assists you through customs, helps collect your luggage and leads you through the arrivals gate to meet your guide.',
      'Jaya House River Park sits alongside the Siem Reap River among fully grown trees, about a 6-minute tuk-tuk ride from town toward the temples. Two pools, a spa and an all-day restaurant.',
    ],
  },
  {
    n: 9,
    date: '2027-02-04',
    place: 'Siem Reap',
    country: 'Cambodia',
    title: 'Cross an Item off the Bucket List',
    route: null,
    steps: [
      { kind: 'tour', title: 'Sunrise at Angkor Wat', duration: '2 hrs', time: '5:00 am', detail: 'Leave the hotel at 5:00 am. Back by 7:00 am for breakfast.' },
      { kind: 'tour', title: 'Highlights of Angkor', duration: '9.5 hrs', detail: 'Private tour with lunch. Angkor Thom, Bayon, Ta Prohm, Angkor Wat, sunset at Srah Srang.' },
      { kind: 'hotel', title: 'Jaya House River Park', detail: 'Night 2 of 3.' },
    ],
    hotel: { name: 'Jaya House River Park', room: 'Deluxe Room with Breakfast', nights: 3 },
    notes: ['5:00 am departure. Water, towels and lunch are included on the full-day tour.', 'Temple dress: shoulders and knees covered.'],
    body: [
      'The day starts early as you leave your hotel at 5:00 am for Angkor Wat, the largest and most breathtaking monument at Angkor. Built as the funeral temple for Suryavarman II, who ruled from 1112 to 1152, it rewards every visitor with its grand scale, surreal bas-reliefs and incredible attention to detail. You enter from the quiet east side to avoid the crowds, then return to the hotel by 7:00 am for breakfast.',
      'Then your private guide and driver take you through a full day of the Angkor Archaeological Park, which covers around 250 square miles with ruins from the 9th to 15th centuries in the distinctive Khmer style. You will first see the South Gate of Angkor Thom, then the temples of Bayon and Baphuon, the Terrace of Elephants and the Terrace of the Leper King.',
      'After lunch back in town, head to the jungle temple of Ta Prohm, where trees grow out of the temple and roots crawl up its walls. For many people this is the highlight of Angkor. Finish with a peaceful sunset at Srah Srang.',
    ],
  },
  {
    n: 10,
    date: '2027-02-05',
    place: 'Siem Reap',
    country: 'Cambodia',
    title: 'One-of-a-kind!',
    route: null,
    steps: [
      { kind: 'tour', title: 'West Baray Temple Safari by Open-Air Jeep', duration: '4 hrs', detail: 'Hidden temples of Angkor Thom, Banteay Thom, Prasat Cha and the West Baray.' },
      { kind: 'cruise', title: 'Sunset Cruise aboard the Chnneah Chivit', duration: '4.5 hrs', time: 'Late afternoon', detail: 'Restored fishing vessel on Tonle Sap lake. Cocktails and canapes.' },
      { kind: 'hotel', title: 'Jaya House River Park', detail: 'Night 3 of 3.' },
    ],
    hotel: { name: 'Jaya House River Park', room: 'Deluxe Room with Breakfast', nights: 3 },
    notes: ['The jeep is open-air: hat, sunglasses and a scarf for dust.'],
    body: [
      'Embark on an extraordinary jeep tour through the lesser-known corners of the Angkor Archaeological Park. Begin at Angkor Thom, once the royal capital under Jayavarman VII. Traverse the ancient city walls, see the Apsara sculptures at Banteay Thom, and venture on to Chan Ta Oun Temple.',
      'Go deep into the jungle to the ruins of Prasat Cha, then Wat Tol Kpuos on the banks of the Baray, and Kok Po, a sanctuary from the Chenla period. Conclude at Spean Memay, the Bridge of Mirrors, leading to the West Baray, once the world\'s largest man-made reservoir, built by 20,000 artisans over a millennium ago.',
      'Later, step aboard a beautifully restored traditional fishing vessel for a journey across Cambodia\'s largest freshwater lake. Drift past floating villages as fishermen return with the evening catch, with handcrafted cocktails and canapes as the sky turns gold.',
    ],
  },
  {
    n: 11,
    date: '2027-02-06',
    place: 'Chiang Mai',
    country: 'Thailand',
    title: 'En Route',
    route: 'Siem Reap to Bangkok to Chiang Mai',
    steps: [
      { kind: 'transfer', title: 'Private transfer to Siem Reap Airport', detail: 'Driver and English-speaking guide.' },
      { kind: 'flight', title: 'Fly Siem Reap to Bangkok', duration: '1 hr 15 min', detail: 'Bangkok Airways, economy.' },
      { kind: 'flight', title: 'Fly Bangkok to Chiang Mai', duration: '1.5 hrs', detail: 'Direct, economy.' },
      { kind: 'arrive', title: 'Arrive Chiang Mai', detail: 'VIP meet & greet with fast-track immigration. A representative greets you as you leave the plane.' },
      { kind: 'transfer', title: 'Private transfer to hotel', detail: 'Driver and English-speaking guide.' },
      { kind: 'hotel', title: 'Check in: Amanor Hotel Chiang Mai', detail: 'Manor Suite, breakfast included.' },
    ],
    hotel: { name: 'Amanor Hotel Chiang Mai', room: 'Manor Suite with Breakfast', nights: 3 },
    notes: ['Two flights today. Third country: Thailand.', 'Thai fast-track: dress neatly. No shorts or flip-flops through immigration.'],
    body: [
      'You will be privately transferred to the airport, then fly from Siem Reap to Bangkok, Thailand. Flight time is approximately 1 hour and 15 minutes. From Bangkok, board a direct flight to Chiang Mai, about 1.5 hours.',
      'On arrival in Chiang Mai, a representative greets you after exiting the plane and escorts you through fast-track services, avoiding the queues at immigration. Guests using fast track should wear appropriate attire and avoid short pants or slippers, to ensure a smooth process with Thai immigration.',
      'Amanor Chiang Mai sits in the Nimmanhaemin district, with a rooftop pool and bar framed by the silhouette of Doi Suthep at sunset.',
    ],
  },
  {
    n: 12,
    date: '2027-02-07',
    place: 'Chiang Mai',
    country: 'Thailand',
    title: 'Fun in the Sun',
    route: null,
    steps: [
      { kind: 'tour', title: 'Gentle Giants: A Day at Kanta Elephant Sanctuary', duration: '8 hrs', detail: 'Private, with lunch. Feed and observe rescued elephants.' },
      { kind: 'hotel', title: 'Amanor Hotel Chiang Mai', detail: 'Night 2 of 3.' },
    ],
    hotel: { name: 'Amanor Hotel Chiang Mai', room: 'Manor Suite with Breakfast', nights: 3 },
    notes: ['You will change into keeper\'s clothes at the sanctuary. Bring a change of clothes and shoes you do not mind getting muddy.'],
    body: [
      'Today you will interact with Thailand\'s rescued elephants, learning about their needs and the sanctuary\'s work. Venture to the tranquil outskirts of Chiang Mai through rural landscapes to this haven of rescue and rehabilitation.',
      'Once you have arrived, you change into traditional elephant keeper attire before meeting the elephants. Help prepare the elephants\' daily meals and feedings, and learn how to care for these gentle giants.',
      'After lunch, continue with interactive activities and time observing the elephants in their surroundings. At the end of the experience, meet your private driver for the transfer back to your hotel.',
    ],
  },
  {
    n: 13,
    date: '2027-02-08',
    place: 'Chiang Mai',
    country: 'Thailand',
    title: 'A Well-Earned Break',
    route: null,
    steps: [
      { kind: 'tour', title: 'Doi Suthep & Temples', duration: '4 hrs', detail: 'Private tour. Mountain-top temple 3,500 feet above the city. 308 steps, or take the cable car.' },
      { kind: 'hotel', title: 'Amanor Hotel Chiang Mai', detail: 'Night 3 of 3.' },
    ],
    hotel: { name: 'Amanor Hotel Chiang Mai', room: 'Manor Suite with Breakfast', nights: 3 },
    notes: ['Temple dress code: shoulders covered, no shorts, shoes off inside.', 'Half day only. The afternoon is free.'],
    body: [
      'The most sacred temple in northern Thailand is Wat Phra That Doi Suthep, believed to contain a relic of the Lord Buddha. Head to the outskirts of the city with your private guide to visit this mountain-top compound, 3,500 feet above the city.',
      'Breathtaking views of Chiang Mai and the surrounding countryside reward the 308-step staircase, or you may choose the small cable car. Listen to the chants of the monks, mingle with pilgrims from across Thailand, and discover pagodas and statues devoted to Buddhism with Hindu influences.',
    ],
  },
  {
    n: 14,
    date: '2027-02-09',
    place: 'Bangkok',
    country: 'Thailand',
    title: 'Back to Bangkok',
    route: 'Chiang Mai to Bangkok',
    steps: [
      { kind: 'transfer', title: 'Private transfer to Chiang Mai Airport', detail: 'Driver and English-speaking guide.' },
      { kind: 'flight', title: 'Fly Chiang Mai to Bangkok', duration: '1 hr', detail: 'Direct, economy.' },
      { kind: 'transfer', title: 'Private transfer to hotel', detail: 'Driver and English-speaking guide.' },
      { kind: 'hotel', title: 'Check in: Avani+ Riverside Bangkok', detail: 'Avani Panorama River View Room, breakfast included.' },
    ],
    hotel: { name: 'Avani+ Riverside Bangkok Hotel', room: 'Avani Panorama River View Room with Breakfast', nights: 2 },
    notes: [],
    body: [
      'You will be privately transferred to the airport and board a direct flight from Chiang Mai to Bangkok. Approximate flight time is 1 hour. On arrival, a private transfer takes you to your hotel.',
      'Avani+ Riverside sits on the banks of the Chao Phraya River, with an infinity pool and rooftop dining looking across the water to the Bangkok skyline.',
    ],
  },
  {
    n: 15,
    date: '2027-02-10',
    place: 'Bangkok',
    country: 'Thailand',
    title: 'The Ancient Capital',
    route: null,
    steps: [
      { kind: 'tour', title: 'The Ancient & Iconic Capital', duration: '7 hrs', time: 'Early morning', detail: 'With lunch. Wat Pho, City Pillar Shrine, Grand Palace, Wat Phra Kaew, ferry to Wat Arun, Kudi Jeen, flower market.' },
      { kind: 'hotel', title: 'Avani+ Riverside Bangkok', detail: 'Night 2 of 2. Last night of the trip.' },
    ],
    hotel: { name: 'Avani+ Riverside Bangkok Hotel', room: 'Avani Panorama River View Room with Breakfast', nights: 2 },
    notes: ['Strict temple dress: no sleeveless, see-through or mesh tops, no short shorts or miniskirts. Shoes off for morning alms.', 'Pack tonight. Tomorrow is the flight home.'],
    body: [
      'Discover the many faces of Bangkok as you weave through the city\'s most iconic landmarks. Start by witnessing the monks\' early-morning chanting at Wat Pho, one of the city\'s oldest temples, home to the largest reclining Buddha in the country at 150 feet. Hear stories and legends at the City Pillar Shrine.',
      'Be swept up by the grandeur of the Grand Palace, the former royal residence, and step inside Wat Phra Kaew, the Temple of the Emerald Buddha, the spiritual seat of Thai Buddhism.',
      'After lunch at a family-style Thai restaurant, ride the ferry across the Chao Phraya River to Wat Arun, the Temple of Dawn, and climb its mosaic-covered towers for a view across the city. Spend time in the Kudi Jeen neighborhood around the Santa Cruz Church and try the local baked sweet. Finish at Bangkok\'s flower market.',
    ],
  },
  {
    n: 16,
    date: '2027-02-11',
    place: 'Bangkok',
    country: 'Thailand',
    title: 'Until Next Time',
    route: 'Bangkok to home',
    steps: [
      { kind: 'transfer', title: 'Private transfer to Bangkok Airport', detail: 'Driver and English-speaking guide.' },
      { kind: 'depart', title: 'Fly home', detail: 'International flight, booked separately from the tour.' },
    ],
    hotel: null,
    notes: ['Check out of Avani+ Riverside this morning.', 'Passports, chargers, and anything in the room safe.'],
    body: [
      'You will be privately transferred from your hotel to the airport by a professional driver and an English-speaking guide. Safe travels home.',
    ],
  },
];

export const hotels = [
  { name: 'Oriental Jade Hotel', city: 'Hanoi', days: [1, 2, 3], blurb: '120 rooms with views of Hoan Kiem Lake and the Old Quarter. On Hang Trong Street, walking distance to everything. Spa, gym and a 12th-floor outdoor pool.' },
  { name: 'Lyra Grandeur Cruise', city: 'Halong Bay', days: [4, 5], blurb: 'Capella Cruises, launched June 2025. 33 suite-style cabins with private balconies and ocean-view bathtubs. All excursions and meals included.' },
  { name: 'Caravelle Saigon', city: 'Ho Chi Minh City', days: [6, 7], blurb: 'A city-center landmark since 1959, a short walk from the Opera House, Notre Dame Cathedral and Ben Thanh Market. Pool, spa, 24-hour gym.' },
  { name: 'Jaya House River Park', city: 'Siem Reap', days: [8, 9, 10], blurb: '36-room boutique hotel on the Siem Reap River, six minutes by tuk-tuk from town toward the temples. Two pools, spa, all-day restaurant.' },
  { name: 'Amanor Hotel Chiang Mai', city: 'Chiang Mai', days: [11, 12, 13], blurb: 'In the Nimmanhaemin district. Rooftop pool and bar with sunset views of Doi Suthep. In-room massage available.' },
  { name: 'Avani+ Riverside Bangkok Hotel', city: 'Bangkok', days: [14, 15], blurb: 'On the Chao Phraya River with 250 rooms, an infinity pool and rooftop lounge looking across to the skyline.' },
];

export const essentials = [
  { heading: 'Documents', items: ['Passports', 'Printed color copy of your Vietnam eVisa (immigration will ask for it)', 'Kensington travel documents', 'International flight confirmations'] },
  { heading: 'Dress', items: ['Temples in Cambodia and Thailand: shoulders and knees covered, shoes off inside', 'Thai fast-track immigration: no shorts or flip-flops', 'Elephant sanctuary: clothes and shoes that can get muddy'] },
  { heading: 'Early starts', items: ['Day 9, Feb 4: leave the hotel at 5:00 am for sunrise at Angkor Wat'] },
  { heading: 'Not included', items: ['Lunches and dinners unless the day says so', 'Drinks', 'Tips for guides and drivers', 'Visas unless noted (Vietnam eVisa is in your documents; Cambodia visa is handled on arrival)'] },
];

// Alt text for every photo the app shows. Written for the family member who
// cannot see the picture, not for search engines.
export const photoAlts = {
  days: {
    1: 'The lobby of the Oriental Jade Hotel in Hanoi, black lacquer and red velvet',
    2: 'The stone facade of the Military History Museum in Hanoi',
    3: 'Rows of glazed pottery at Bat Trang village',
    4: 'The Lyra Grandeur cruise ship among the limestone islands of Halong Bay',
    5: 'The pool deck of the Lyra Grandeur cruise ship',
    6: 'The Caravelle Saigon hotel tower over Lam Son Square',
    7: 'Wooden boats crowded together at a floating market on the Mekong Delta',
    8: 'Jaya House River Park at night, lit up beside its pool',
    9: 'Angkor Wat at sunrise, reflected in the lily pond',
    10: 'Tree roots spilling over the stones of a jungle temple at Angkor',
    11: 'The rooftop of the Amanor Hotel Chiang Mai',
    12: 'An Asian elephant walking through the forest near Chiang Mai',
    13: 'The gilded chedi of Wat Phra That Doi Suthep',
    14: 'The Avani+ Riverside hotel on the Chao Phraya River in Bangkok',
    15: 'The reclining Buddha and tiled rooftops of Wat Pho',
    16: 'A mountain pagoda near Chiang Mai at sunset',
  },
  covers: {
    'halong-junk': 'A red-sailed junk on Halong Bay at sunset',
    'hanoi-raft': 'A woman poling a bamboo raft on a river near Hanoi',
    'chiang-mai-pagoda': 'A mountain pagoda near Chiang Mai at sunset',
    'angkor': 'Monks in orange robes walking toward Angkor Wat',
  },
  hotels: {
    'oriental-jade': ['Lobby lounge with black cane chairs and red cushions', 'A guest room with a view of Hoan Kiem Lake', 'The hotel exterior on Hang Trong Street'],
    'lyra': ['The Lyra Grandeur cruise ship in Halong Bay', 'The pool deck', 'The spa', 'The restaurant'],
    'caravelle': ['The Caravelle Saigon tower', 'The lobby', 'The swimming pool', 'The dining room', 'A Signature Room'],
    'jaya': ['Jaya House River Park at night beside its pool', 'The swimming pool among the trees', 'The dining terrace', 'A Deluxe Room'],
    'amanor': ['The rooftop of the Amanor Chiang Mai', 'The rooftop bar at dusk', 'The rooftop pool', 'The dining room', 'The Manor Suite'],
    'avani': ['The Avani+ Riverside on the Chao Phraya River', 'The infinity pool over the river', 'The rooftop lounge', 'The dining room', 'A Panorama River View Room'],
  },
};
