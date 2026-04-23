/**
 * Travel rewards static data
 * CPP values sourced from TPG / NerdWallet valuations (April 2026 baseline)
 */

export interface PointValuation {
  cpp: number; // cents per point
  name: string;
}

export const POINT_VALUATIONS: Record<string, PointValuation> = {
  "Chase UR":            { cpp: 2.0, name: "Chase Ultimate Rewards" },
  "Amex MR":             { cpp: 2.0, name: "Amex Membership Rewards" },
  "Citi TYP":            { cpp: 1.7, name: "Citi ThankYou Points" },
  "Capital One Miles":   { cpp: 1.7, name: "Capital One Miles" },
  "United Miles":        { cpp: 1.4, name: "United MileagePlus" },
  "Delta SkyMiles":      { cpp: 1.2, name: "Delta SkyMiles" },
  "American AAdvantage": { cpp: 1.5, name: "American AAdvantage" },
  "Southwest Points":    { cpp: 1.5, name: "Southwest Rapid Rewards" },
  "Alaska Miles":        { cpp: 1.8, name: "Alaska Mileage Plan" },
  "Hyatt Points":        { cpp: 1.7, name: "World of Hyatt" },
  "Marriott Points":     { cpp: 0.8, name: "Marriott Bonvoy" },
  "Hilton Points":       { cpp: 0.6, name: "Hilton Honors" },
};

export interface TransferPartnerInfo {
  airlines: string[];
  hotels: string[];
  ratio: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export const AIRPORTS: Airport[] = [
  { code: "ATL", name: "Hartsfield-Jackson Atlanta International", city: "Atlanta", country: "US" },
  { code: "LAX", name: "Los Angeles International", city: "Los Angeles", country: "US" },
  { code: "ORD", name: "O'Hare International", city: "Chicago", country: "US" },
  { code: "DFW", name: "Dallas/Fort Worth International", city: "Dallas", country: "US" },
  { code: "DEN", name: "Denver International", city: "Denver", country: "US" },
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "US" },
  { code: "SFO", name: "San Francisco International", city: "San Francisco", country: "US" },
  { code: "SEA", name: "Seattle-Tacoma International", city: "Seattle", country: "US" },
  { code: "LAS", name: "Harry Reid International", city: "Las Vegas", country: "US" },
  { code: "MCO", name: "Orlando International", city: "Orlando", country: "US" },
  { code: "EWR", name: "Newark Liberty International", city: "Newark", country: "US" },
  { code: "MIA", name: "Miami International", city: "Miami", country: "US" },
  { code: "PHX", name: "Phoenix Sky Harbor International", city: "Phoenix", country: "US" },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "US" },
  { code: "BOS", name: "Logan International", city: "Boston", country: "US" },
  { code: "MSP", name: "Minneapolis-Saint Paul International", city: "Minneapolis", country: "US" },
  { code: "DTW", name: "Detroit Metropolitan Wayne County", city: "Detroit", country: "US" },
  { code: "FLL", name: "Fort Lauderdale-Hollywood International", city: "Fort Lauderdale", country: "US" },
  { code: "PHL", name: "Philadelphia International", city: "Philadelphia", country: "US" },
  { code: "LGA", name: "LaGuardia Airport", city: "New York", country: "US" },
  { code: "BWI", name: "Baltimore/Washington International", city: "Baltimore", country: "US" },
  { code: "IAD", name: "Dulles International", city: "Washington D.C.", country: "US" },
  { code: "DCA", name: "Ronald Reagan Washington National", city: "Washington D.C.", country: "US" },
  { code: "SLC", name: "Salt Lake City International", city: "Salt Lake City", country: "US" },
  { code: "SAN", name: "San Diego International", city: "San Diego", country: "US" },
  { code: "TPA", name: "Tampa International", city: "Tampa", country: "US" },
  { code: "PDX", name: "Portland International", city: "Portland", country: "US" },
  { code: "HNL", name: "Daniel K. Inouye International", city: "Honolulu", country: "US" },
  { code: "AUS", name: "Austin-Bergstrom International", city: "Austin", country: "US" },
  { code: "BNA", name: "Nashville International", city: "Nashville", country: "US" },
  { code: "MCI", name: "Kansas City International", city: "Kansas City", country: "US" },
  { code: "STL", name: "St. Louis Lambert International", city: "St. Louis", country: "US" },
  { code: "CLE", name: "Cleveland Hopkins International", city: "Cleveland", country: "US" },
  { code: "PIT", name: "Pittsburgh International", city: "Pittsburgh", country: "US" },
  { code: "RDU", name: "Raleigh-Durham International", city: "Raleigh", country: "US" },
  { code: "MSY", name: "Louis Armstrong New Orleans International", city: "New Orleans", country: "US" },
  { code: "SJC", name: "Norman Y. Mineta San José International", city: "San Jose", country: "US" },
  { code: "OAK", name: "Oakland International", city: "Oakland", country: "US" },
  { code: "SMF", name: "Sacramento International", city: "Sacramento", country: "US" },
  { code: "MEM", name: "Memphis International", city: "Memphis", country: "US" },
  { code: "CHS", name: "Charleston International", city: "Charleston", country: "US" },
  { code: "BDL", name: "Bradley International", city: "Hartford", country: "US" },
  { code: "BUF", name: "Buffalo Niagara International", city: "Buffalo", country: "US" },
  { code: "ORF", name: "Norfolk International", city: "Norfolk", country: "US" },
  { code: "ABQ", name: "Albuquerque International Sunport", city: "Albuquerque", country: "US" },
  { code: "OMA", name: "Eppley Airfield", city: "Omaha", country: "US" },
  { code: "PVD", name: "T.F. Green Airport", city: "Providence", country: "US" },
  { code: "GRR", name: "Gerald R. Ford International", city: "Grand Rapids", country: "US" },
  { code: "BOI", name: "Boise Airport", city: "Boise", country: "US" },
  { code: "TUS", name: "Tucson International", city: "Tucson", country: "US" },
  { code: "LHR", name: "Heathrow Airport", city: "London", country: "UK" },
  { code: "LGW", name: "Gatwick Airport", city: "London", country: "UK" },
  { code: "CDG", name: "Charles de Gaulle Airport", city: "Paris", country: "FR" },
  { code: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "NL" },
  { code: "FRA", name: "Frankfurt Airport", city: "Frankfurt", country: "DE" },
  { code: "MAD", name: "Adolfo Suárez Madrid–Barajas", city: "Madrid", country: "ES" },
  { code: "BCN", name: "El Prat Airport", city: "Barcelona", country: "ES" },
  { code: "FCO", name: "Leonardo da Vinci International", city: "Rome", country: "IT" },
  { code: "MXP", name: "Malpensa Airport", city: "Milan", country: "IT" },
  { code: "ZRH", name: "Zurich Airport", city: "Zurich", country: "CH" },
  { code: "VIE", name: "Vienna International Airport", city: "Vienna", country: "AT" },
  { code: "CPH", name: "Copenhagen Airport", city: "Copenhagen", country: "DK" },
  { code: "ARN", name: "Stockholm Arlanda Airport", city: "Stockholm", country: "SE" },
  { code: "HEL", name: "Helsinki Airport", city: "Helsinki", country: "FI" },
  { code: "DUB", name: "Dublin Airport", city: "Dublin", country: "IE" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR" },
  { code: "DXB", name: "Dubai International Airport", city: "Dubai", country: "AE" },
  { code: "AUH", name: "Abu Dhabi International Airport", city: "Abu Dhabi", country: "AE" },
  { code: "DOH", name: "Hamad International Airport", city: "Doha", country: "QA" },
  { code: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "SG" },
  { code: "HKG", name: "Hong Kong International Airport", city: "Hong Kong", country: "HK" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo", country: "JP" },
  { code: "HND", name: "Haneda Airport", city: "Tokyo", country: "JP" },
  { code: "ICN", name: "Incheon International Airport", city: "Seoul", country: "KR" },
  { code: "PEK", name: "Beijing Capital International", city: "Beijing", country: "CN" },
  { code: "PVG", name: "Shanghai Pudong International", city: "Shanghai", country: "CN" },
  { code: "BKK", name: "Suvarnabhumi Airport", city: "Bangkok", country: "TH" },
  { code: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "MY" },
  { code: "CGK", name: "Soekarno-Hatta International", city: "Jakarta", country: "ID" },
  { code: "SYD", name: "Kingsford Smith Airport", city: "Sydney", country: "AU" },
  { code: "MEL", name: "Melbourne Airport", city: "Melbourne", country: "AU" },
  { code: "AKL", name: "Auckland Airport", city: "Auckland", country: "NZ" },
  { code: "GRU", name: "Guarulhos International", city: "São Paulo", country: "BR" },
  { code: "EZE", name: "Ministro Pistarini International", city: "Buenos Aires", country: "AR" },
  { code: "BOG", name: "El Dorado International", city: "Bogotá", country: "CO" },
  { code: "LIM", name: "Jorge Chávez International", city: "Lima", country: "PE" },
  { code: "SCL", name: "Arturo Merino Benítez International", city: "Santiago", country: "CL" },
  { code: "YYZ", name: "Toronto Pearson International", city: "Toronto", country: "CA" },
  { code: "YVR", name: "Vancouver International Airport", city: "Vancouver", country: "CA" },
  { code: "YUL", name: "Montréal-Trudeau International", city: "Montreal", country: "CA" },
  { code: "MEX", name: "Benito Juárez International", city: "Mexico City", country: "MX" },
  { code: "CUN", name: "Cancún International", city: "Cancún", country: "MX" },
  { code: "NBO", name: "Jomo Kenyatta International", city: "Nairobi", country: "KE" },
  { code: "JNB", name: "O.R. Tambo International", city: "Johannesburg", country: "ZA" },
  { code: "CPT", name: "Cape Town International", city: "Cape Town", country: "ZA" },
  { code: "CAI", name: "Cairo International Airport", city: "Cairo", country: "EG" },
  { code: "BOM", name: "Chhatrapati Shivaji Maharaj International", city: "Mumbai", country: "IN" },
  { code: "DEL", name: "Indira Gandhi International", city: "New Delhi", country: "IN" },
  { code: "BLR", name: "Kempegowda International", city: "Bangalore", country: "IN" },
];

export function searchAirports(query: string, limit = 6): Airport[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase();
  const exact = AIRPORTS.filter((a) => a.code.toLowerCase() === q);
  const starts = AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase() !== q &&
      (a.code.toLowerCase().startsWith(q) ||
        a.city.toLowerCase().startsWith(q) ||
        a.name.toLowerCase().startsWith(q))
  );
  const contains = AIRPORTS.filter(
    (a) =>
      !a.code.toLowerCase().startsWith(q) &&
      !a.city.toLowerCase().startsWith(q) &&
      !a.name.toLowerCase().startsWith(q) &&
      (a.city.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
  );
  return [...exact, ...starts, ...contains].slice(0, limit);
}

export const TRANSFER_PARTNERS: Record<string, TransferPartnerInfo> = {
  "Chase Ultimate Rewards": {
    airlines: [
      "United MileagePlus",
      "Southwest Rapid Rewards",
      "British Airways Avios",
      "Air France/KLM FlyingBlue",
      "Singapore KrisFlyer",
      "Iberia Plus",
      "Virgin Atlantic Flying Club",
      "Aer Lingus AerClub",
      "Air Canada Aeroplan",
    ],
    hotels: ["World of Hyatt", "IHG One Rewards"],
    ratio: "1:1",
  },
  "Amex Membership Rewards": {
    airlines: [
      "Delta SkyMiles",
      "Air France/KLM FlyingBlue",
      "British Airways Avios",
      "Singapore KrisFlyer",
      "ANA Mileage Club",
      "Cathay Pacific Asia Miles",
      "Emirates Skywards",
      "Iberia Plus",
      "Virgin Atlantic Flying Club",
      "Air Canada Aeroplan",
      "Avianca LifeMiles",
      "Etihad Guest",
      "Qantas Frequent Flyer",
    ],
    hotels: ["Marriott Bonvoy", "Hilton Honors", "Choice Privileges"],
    ratio: "1:1",
  },
  "Citi ThankYou Points": {
    airlines: [
      "Turkish Airlines Miles&Smiles",
      "Air France/KLM FlyingBlue",
      "Avianca LifeMiles",
      "Singapore KrisFlyer",
      "Cathay Pacific Asia Miles",
      "Etihad Guest",
      "Emirates Skywards",
      "EVA Air Infinity MileageLands",
      "Qatar Avios",
      "Air Canada Aeroplan",
      "Virgin Atlantic Flying Club",
    ],
    hotels: [],
    ratio: "1:1",
  },
  "Capital One Miles": {
    airlines: [
      "Air France/KLM FlyingBlue",
      "Turkish Airlines Miles&Smiles",
      "Avianca LifeMiles",
      "Singapore KrisFlyer",
      "TAP Air Portugal Miles&Go",
      "EVA Air Infinity MileageLands",
      "Cathay Pacific Asia Miles",
      "Etihad Guest",
      "Emirates Skywards",
      "British Airways Avios",
      "Finnair Plus",
      "Air Canada Aeroplan",
    ],
    hotels: ["Wyndham Rewards", "Choice Privileges"],
    ratio: "1:1",
  },
};
