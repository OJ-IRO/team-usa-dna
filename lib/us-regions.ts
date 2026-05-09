// Hand-curated map: US state → sports historically prominent in that state's
// athletic culture. Used only to add visual context on the results page;
// none of this influences the matcher.

export type StateCode =
  | "AL" | "AK" | "AZ" | "AR" | "CA" | "CO" | "CT" | "DE" | "DC" | "FL"
  | "GA" | "HI" | "ID" | "IL" | "IN" | "IA" | "KS" | "KY" | "LA" | "ME"
  | "MD" | "MA" | "MI" | "MN" | "MS" | "MO" | "MT" | "NE" | "NV" | "NH"
  | "NJ" | "NM" | "NY" | "NC" | "ND" | "OH" | "OK" | "OR" | "PA" | "RI"
  | "SC" | "SD" | "TN" | "TX" | "UT" | "VT" | "VA" | "WA" | "WV" | "WI" | "WY";

const STATE_DATA: Record<StateCode, { name: string; region: string; sports: string[]; flavor: string }> = {
  AL: { name: "Alabama", region: "Deep South", sports: ["Football", "Track", "Boxing"], flavor: "Football culture, sprint power, combat heritage" },
  AK: { name: "Alaska", region: "Last Frontier", sports: ["Cross-Country Skiing", "Ice Hockey", "Mountain Sports"], flavor: "Endurance + cold-weather grit" },
  AZ: { name: "Arizona", region: "Sun Belt", sports: ["Baseball", "Track", "Tennis"], flavor: "Spring-training baseball, dry-heat distance" },
  AR: { name: "Arkansas", region: "South Central", sports: ["Football", "Basketball", "Track"], flavor: "Tight-knit programs, sprint + power" },
  CA: { name: "California", region: "Pacific Coast", sports: ["Swimming", "Track", "Surfing", "Volleyball"], flavor: "Aquatic + endurance powerhouse" },
  CO: { name: "Colorado", region: "Mountain West", sports: ["Skiing", "Snowboarding", "Cycling", "Endurance Running"], flavor: "Altitude endurance + winter sports" },
  CT: { name: "Connecticut", region: "New England", sports: ["Hockey", "Sailing", "Lacrosse"], flavor: "Maritime + ice culture" },
  DE: { name: "Delaware", region: "Mid-Atlantic", sports: ["Lacrosse", "Field Hockey", "Track"], flavor: "Stick-sport heritage" },
  DC: { name: "District of Columbia", region: "Mid-Atlantic", sports: ["Basketball", "Track", "Soccer"], flavor: "Urban basketball pipeline" },
  FL: { name: "Florida", region: "Southeast", sports: ["Swimming", "Football", "Track", "Tennis"], flavor: "Aquatic + sprint factory" },
  GA: { name: "Georgia", region: "Southeast", sports: ["Track", "Football", "Basketball"], flavor: "Sprint + jump tradition" },
  HI: { name: "Hawai'i", region: "Pacific Islands", sports: ["Surfing", "Volleyball", "Swimming"], flavor: "Ocean-sport culture" },
  ID: { name: "Idaho", region: "Mountain West", sports: ["Skiing", "Track", "Wrestling"], flavor: "Mountain endurance + grappling" },
  IL: { name: "Illinois", region: "Midwest", sports: ["Basketball", "Football", "Track"], flavor: "Big-city basketball pipeline" },
  IN: { name: "Indiana", region: "Midwest", sports: ["Basketball", "Track", "Auto Racing"], flavor: "Hoosier hoops + speed culture" },
  IA: { name: "Iowa", region: "Midwest", sports: ["Wrestling", "Track", "Football"], flavor: "Wrestling capital + strength sports" },
  KS: { name: "Kansas", region: "Great Plains", sports: ["Basketball", "Wrestling", "Track"], flavor: "Hoops + grappling lineage" },
  KY: { name: "Kentucky", region: "Upper South", sports: ["Basketball", "Equestrian", "Wrestling"], flavor: "Hoops + horse country" },
  LA: { name: "Louisiana", region: "Deep South", sports: ["Football", "Basketball", "Track"], flavor: "SEC football engine room" },
  ME: { name: "Maine", region: "New England", sports: ["Hockey", "Skiing", "Sailing"], flavor: "Cold-weather endurance" },
  MD: { name: "Maryland", region: "Mid-Atlantic", sports: ["Lacrosse", "Swimming", "Track"], flavor: "Lacrosse mecca + aquatic depth" },
  MA: { name: "Massachusetts", region: "New England", sports: ["Hockey", "Rowing", "Sailing", "Basketball"], flavor: "Ivy + crew + ice tradition" },
  MI: { name: "Michigan", region: "Great Lakes", sports: ["Hockey", "Football", "Basketball"], flavor: "Industrial-era sport powerhouse" },
  MN: { name: "Minnesota", region: "Upper Midwest", sports: ["Hockey", "Cross-Country Skiing", "Speed Skating"], flavor: "Cold-weather sport state" },
  MS: { name: "Mississippi", region: "Deep South", sports: ["Football", "Basketball", "Baseball"], flavor: "Football + raw power tradition" },
  MO: { name: "Missouri", region: "Midwest", sports: ["Basketball", "Wrestling", "Baseball"], flavor: "Hoops + grappling + diamond" },
  MT: { name: "Montana", region: "Mountain West", sports: ["Wrestling", "Mountain Sports", "Track"], flavor: "Wide-open endurance + grappling" },
  NE: { name: "Nebraska", region: "Great Plains", sports: ["Football", "Wrestling", "Track"], flavor: "Cornhusker football + strength sports" },
  NV: { name: "Nevada", region: "Mountain West", sports: ["Boxing", "MMA", "Basketball"], flavor: "Combat sport capital" },
  NH: { name: "New Hampshire", region: "New England", sports: ["Skiing", "Hockey", "Mountain Sports"], flavor: "White Mountain endurance" },
  NJ: { name: "New Jersey", region: "Mid-Atlantic", sports: ["Basketball", "Wrestling", "Soccer"], flavor: "Dense recruiting ground for hoops + grappling" },
  NM: { name: "New Mexico", region: "Southwest", sports: ["Basketball", "Track", "Wrestling"], flavor: "Altitude-trained athletics" },
  NY: { name: "New York", region: "Mid-Atlantic", sports: ["Basketball", "Boxing", "Track"], flavor: "Urban hoops + boxing legacy" },
  NC: { name: "North Carolina", region: "Southeast", sports: ["Basketball", "Football", "Track"], flavor: "ACC basketball stronghold" },
  ND: { name: "North Dakota", region: "Upper Midwest", sports: ["Hockey", "Wrestling", "Track"], flavor: "Cold-weather mat sports" },
  OH: { name: "Ohio", region: "Midwest", sports: ["Football", "Track", "Basketball", "Wrestling"], flavor: "Football + multi-sport pipeline" },
  OK: { name: "Oklahoma", region: "South Central", sports: ["Wrestling", "Football", "Track"], flavor: "Wrestling lineage + Sooner football" },
  OR: { name: "Oregon", region: "Pacific Northwest", sports: ["Track", "Basketball", "Mountain Sports"], flavor: "Track Town USA — distance running mecca" },
  PA: { name: "Pennsylvania", region: "Mid-Atlantic", sports: ["Wrestling", "Football", "Basketball"], flavor: "Wrestling + Friday-night-lights" },
  RI: { name: "Rhode Island", region: "New England", sports: ["Sailing", "Hockey", "Basketball"], flavor: "Sailing pedigree" },
  SC: { name: "South Carolina", region: "Southeast", sports: ["Football", "Track", "Basketball"], flavor: "SEC football + sprint culture" },
  SD: { name: "South Dakota", region: "Upper Midwest", sports: ["Wrestling", "Basketball", "Track"], flavor: "Plains grappling + small-town basketball" },
  TN: { name: "Tennessee", region: "Upper South", sports: ["Football", "Basketball", "Track"], flavor: "Volunteer football + women's basketball legacy" },
  TX: { name: "Texas", region: "South Central", sports: ["Football", "Basketball", "Track", "Baseball"], flavor: "Sprint, throw, and Friday-night-lights culture" },
  UT: { name: "Utah", region: "Mountain West", sports: ["Skiing", "Snowboarding", "Mountain Sports"], flavor: "Winter sport hub" },
  VT: { name: "Vermont", region: "New England", sports: ["Skiing", "Hockey", "Mountain Sports"], flavor: "Green Mountain winter culture" },
  VA: { name: "Virginia", region: "Mid-Atlantic", sports: ["Football", "Lacrosse", "Track"], flavor: "Mid-Atlantic stick-sport + speed" },
  WA: { name: "Washington", region: "Pacific Northwest", sports: ["Basketball", "Soccer", "Mountain Sports", "Hockey"], flavor: "Marine + mountain blend" },
  WV: { name: "West Virginia", region: "Appalachia", sports: ["Wrestling", "Football", "Basketball"], flavor: "Mountain wrestling lineage" },
  WI: { name: "Wisconsin", region: "Upper Midwest", sports: ["Hockey", "Football", "Speed Skating"], flavor: "Ice + speed tradition" },
  WY: { name: "Wyoming", region: "Mountain West", sports: ["Wrestling", "Rodeo", "Mountain Sports"], flavor: "Wide-open endurance + rough sport" },
};

const STATE_NAMES_TO_CODES: Record<string, StateCode> = Object.entries(STATE_DATA).reduce(
  (acc, [code, info]) => {
    acc[info.name.toLowerCase()] = code as StateCode;
    return acc;
  },
  {} as Record<string, StateCode>,
);

export function parseUSState(hometown: string | undefined): StateCode | null {
  if (!hometown) return null;
  const trimmed = hometown.trim();
  // Match a 2-letter code at the end ("Boulder, CO")
  const codeMatch = trimmed.match(/[,\s]+([A-Z]{2})\s*$/);
  if (codeMatch && (codeMatch[1] as StateCode) in STATE_DATA) {
    return codeMatch[1] as StateCode;
  }
  // Match a state full name appearing anywhere in the string ("Green Cove Springs, Florida")
  const lower = trimmed.toLowerCase();
  for (const [name, code] of Object.entries(STATE_NAMES_TO_CODES)) {
    if (lower.endsWith(name) || lower.includes(", " + name)) return code;
  }
  return null;
}

export function regionInfo(code: StateCode) {
  return STATE_DATA[code];
}
