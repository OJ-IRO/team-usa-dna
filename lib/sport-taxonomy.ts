import type { SportProfile } from "./types";

const DEFAULT_PROFILE: SportProfile = {
  power: 0.5,
  endurance: 0.5,
  speed: 0.5,
  coordination: 0.5,
  soloVsTeam: 0,
  reactionDemand: 0.5,
};

const TAXONOMY: Record<string, SportProfile> = {
  Athletics: { power: 0.7, endurance: 0.6, speed: 0.85, coordination: 0.55, soloVsTeam: 0, reactionDemand: 0.7 },
  Swimming: { power: 0.75, endurance: 0.7, speed: 0.85, coordination: 0.75, soloVsTeam: 0.1, reactionDemand: 0.65 },
  Gymnastics: { power: 0.85, endurance: 0.5, speed: 0.7, coordination: 1.0, soloVsTeam: 0.1, reactionDemand: 0.7 },
  Basketball: { power: 0.7, endurance: 0.75, speed: 0.8, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.85 },
  "Beach Volleyball": { power: 0.75, endurance: 0.7, speed: 0.7, coordination: 0.85, soloVsTeam: 0.7, reactionDemand: 0.85 },
  Volleyball: { power: 0.75, endurance: 0.7, speed: 0.7, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.85 },
  Cycling: { power: 0.7, endurance: 0.95, speed: 0.7, coordination: 0.6, soloVsTeam: 0.3, reactionDemand: 0.5 },
  Rowing: { power: 0.85, endurance: 0.95, speed: 0.6, coordination: 0.65, soloVsTeam: 0.7, reactionDemand: 0.4 },
  Sailing: { power: 0.4, endurance: 0.55, speed: 0.4, coordination: 0.7, soloVsTeam: 0.4, reactionDemand: 0.6 },
  Soccer: { power: 0.6, endurance: 0.85, speed: 0.8, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.85 },
  Football: { power: 0.6, endurance: 0.85, speed: 0.8, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.85 },
  Hockey: { power: 0.7, endurance: 0.8, speed: 0.85, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.95 },
  "Ice Hockey": { power: 0.75, endurance: 0.8, speed: 0.9, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.95 },
  Boxing: { power: 0.95, endurance: 0.75, speed: 0.85, coordination: 0.85, soloVsTeam: 0, reactionDemand: 1.0 },
  Wrestling: { power: 0.95, endurance: 0.8, speed: 0.7, coordination: 0.85, soloVsTeam: 0, reactionDemand: 0.9 },
  Judo: { power: 0.85, endurance: 0.7, speed: 0.7, coordination: 0.9, soloVsTeam: 0, reactionDemand: 0.95 },
  Taekwondo: { power: 0.8, endurance: 0.7, speed: 0.85, coordination: 0.9, soloVsTeam: 0, reactionDemand: 1.0 },
  Fencing: { power: 0.55, endurance: 0.65, speed: 0.85, coordination: 0.95, soloVsTeam: 0, reactionDemand: 1.0 },
  Archery: { power: 0.4, endurance: 0.4, speed: 0.2, coordination: 0.95, soloVsTeam: 0.1, reactionDemand: 0.3 },
  Shooting: { power: 0.2, endurance: 0.3, speed: 0.2, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.5 },
  Weightlifting: { power: 1.0, endurance: 0.3, speed: 0.5, coordination: 0.7, soloVsTeam: 0, reactionDemand: 0.3 },
  Tennis: { power: 0.7, endurance: 0.8, speed: 0.85, coordination: 0.95, soloVsTeam: 0.1, reactionDemand: 0.95 },
  "Table Tennis": { power: 0.4, endurance: 0.55, speed: 0.95, coordination: 0.95, soloVsTeam: 0.1, reactionDemand: 1.0 },
  Badminton: { power: 0.55, endurance: 0.7, speed: 0.95, coordination: 0.95, soloVsTeam: 0.2, reactionDemand: 1.0 },
  Golf: { power: 0.45, endurance: 0.3, speed: 0.4, coordination: 0.9, soloVsTeam: 0.1, reactionDemand: 0.3 },
  Triathlon: { power: 0.55, endurance: 1.0, speed: 0.7, coordination: 0.6, soloVsTeam: 0, reactionDemand: 0.4 },
  Pentathlon: { power: 0.6, endurance: 0.85, speed: 0.7, coordination: 0.85, soloVsTeam: 0, reactionDemand: 0.7 },
  "Modern Pentathlon": { power: 0.6, endurance: 0.85, speed: 0.7, coordination: 0.85, soloVsTeam: 0, reactionDemand: 0.7 },
  "Synchronized Swimming": { power: 0.55, endurance: 0.85, speed: 0.5, coordination: 1.0, soloVsTeam: 0.7, reactionDemand: 0.5 },
  "Artistic Swimming": { power: 0.55, endurance: 0.85, speed: 0.5, coordination: 1.0, soloVsTeam: 0.7, reactionDemand: 0.5 },
  Diving: { power: 0.7, endurance: 0.4, speed: 0.6, coordination: 1.0, soloVsTeam: 0.1, reactionDemand: 0.6 },
  "Water Polo": { power: 0.8, endurance: 0.85, speed: 0.7, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.85 },
  Handball: { power: 0.75, endurance: 0.8, speed: 0.8, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.9 },
  Baseball: { power: 0.7, endurance: 0.5, speed: 0.7, coordination: 0.95, soloVsTeam: 1, reactionDemand: 0.95 },
  Softball: { power: 0.65, endurance: 0.5, speed: 0.7, coordination: 0.95, soloVsTeam: 1, reactionDemand: 0.95 },
  Equestrian: { power: 0.4, endurance: 0.5, speed: 0.5, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.7 },
  Skateboarding: { power: 0.6, endurance: 0.5, speed: 0.7, coordination: 1.0, soloVsTeam: 0, reactionDemand: 0.85 },
  Surfing: { power: 0.6, endurance: 0.7, speed: 0.65, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.85 },
  "Sport Climbing": { power: 0.85, endurance: 0.75, speed: 0.65, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.5 },
  "Beach Sprint Rowing": { power: 0.85, endurance: 0.85, speed: 0.7, coordination: 0.7, soloVsTeam: 0.5, reactionDemand: 0.5 },
  "Wheelchair Basketball": { power: 0.75, endurance: 0.8, speed: 0.75, coordination: 0.9, soloVsTeam: 1, reactionDemand: 0.9 },
  "Wheelchair Rugby": { power: 0.85, endurance: 0.75, speed: 0.7, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.9 },
  "Wheelchair Tennis": { power: 0.65, endurance: 0.75, speed: 0.7, coordination: 0.95, soloVsTeam: 0.1, reactionDemand: 0.95 },
  "Wheelchair Fencing": { power: 0.55, endurance: 0.65, speed: 0.85, coordination: 0.95, soloVsTeam: 0, reactionDemand: 1.0 },
  "Para Swimming": { power: 0.7, endurance: 0.85, speed: 0.8, coordination: 0.7, soloVsTeam: 0, reactionDemand: 0.6 },
  "Para Athletics": { power: 0.7, endurance: 0.7, speed: 0.85, coordination: 0.6, soloVsTeam: 0, reactionDemand: 0.7 },
  "Para Cycling": { power: 0.7, endurance: 0.95, speed: 0.7, coordination: 0.6, soloVsTeam: 0.3, reactionDemand: 0.5 },
  "Para Rowing": { power: 0.85, endurance: 0.95, speed: 0.6, coordination: 0.65, soloVsTeam: 0.7, reactionDemand: 0.4 },
  "Para Triathlon": { power: 0.55, endurance: 1.0, speed: 0.7, coordination: 0.6, soloVsTeam: 0, reactionDemand: 0.4 },
  "Para Powerlifting": { power: 1.0, endurance: 0.3, speed: 0.4, coordination: 0.7, soloVsTeam: 0, reactionDemand: 0.3 },
  "Goalball": { power: 0.55, endurance: 0.7, speed: 0.7, coordination: 0.95, soloVsTeam: 1, reactionDemand: 1.0 },
  "Sitting Volleyball": { power: 0.7, endurance: 0.7, speed: 0.7, coordination: 0.85, soloVsTeam: 1, reactionDemand: 0.85 },
  "Para Archery": { power: 0.4, endurance: 0.4, speed: 0.2, coordination: 0.95, soloVsTeam: 0.1, reactionDemand: 0.3 },
  "Para Equestrian": { power: 0.4, endurance: 0.5, speed: 0.5, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.7 },
  "Para Taekwondo": { power: 0.8, endurance: 0.7, speed: 0.85, coordination: 0.9, soloVsTeam: 0, reactionDemand: 1.0 },
  "Para Judo": { power: 0.85, endurance: 0.7, speed: 0.7, coordination: 0.9, soloVsTeam: 0, reactionDemand: 0.95 },
  "Boccia": { power: 0.2, endurance: 0.2, speed: 0.2, coordination: 0.95, soloVsTeam: 0.3, reactionDemand: 0.3 },
  // Winter sports (Beijing 2022, PyeongChang 2018)
  "Alpine Skiing": { power: 0.7, endurance: 0.65, speed: 0.85, coordination: 0.9, soloVsTeam: 0, reactionDemand: 0.85 },
  "Snowboard": { power: 0.65, endurance: 0.55, speed: 0.75, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.85 },
  "Snowboarding": { power: 0.65, endurance: 0.55, speed: 0.75, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.85 },
  "Speed Skating": { power: 0.7, endurance: 0.85, speed: 0.9, coordination: 0.7, soloVsTeam: 0, reactionDemand: 0.5 },
  "Short Track Speed Skating": { power: 0.7, endurance: 0.7, speed: 0.95, coordination: 0.85, soloVsTeam: 0.3, reactionDemand: 0.95 },
  "Figure Skating": { power: 0.6, endurance: 0.6, speed: 0.5, coordination: 1.0, soloVsTeam: 0.1, reactionDemand: 0.5 },
  "Cross-Country Skiing": { power: 0.45, endurance: 1.0, speed: 0.55, coordination: 0.7, soloVsTeam: 0.2, reactionDemand: 0.3 },
  "Cross Country Skiing": { power: 0.45, endurance: 1.0, speed: 0.55, coordination: 0.7, soloVsTeam: 0.2, reactionDemand: 0.3 },
  "Freestyle Skiing": { power: 0.65, endurance: 0.5, speed: 0.7, coordination: 1.0, soloVsTeam: 0, reactionDemand: 0.85 },
  "Ski Jumping": { power: 0.55, endurance: 0.4, speed: 0.7, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.7 },
  "Biathlon": { power: 0.4, endurance: 0.95, speed: 0.6, coordination: 0.9, soloVsTeam: 0.2, reactionDemand: 0.5 },
  "Luge": { power: 0.45, endurance: 0.4, speed: 0.85, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.95 },
  "Bobsleigh": { power: 0.85, endurance: 0.5, speed: 0.85, coordination: 0.85, soloVsTeam: 0.6, reactionDemand: 0.85 },
  "Bobsled": { power: 0.85, endurance: 0.5, speed: 0.85, coordination: 0.85, soloVsTeam: 0.6, reactionDemand: 0.85 },
  "Skeleton": { power: 0.55, endurance: 0.4, speed: 0.85, coordination: 0.95, soloVsTeam: 0, reactionDemand: 0.95 },
  "Curling": { power: 0.3, endurance: 0.4, speed: 0.3, coordination: 0.95, soloVsTeam: 1.0, reactionDemand: 0.4 },
  "Nordic Combined": { power: 0.55, endurance: 0.95, speed: 0.6, coordination: 0.9, soloVsTeam: 0, reactionDemand: 0.7 },
};

export function profileForSport(sport: string): SportProfile {
  if (TAXONOMY[sport]) return TAXONOMY[sport];
  // Try suffix/prefix matching for variants
  const lower = sport.toLowerCase();
  for (const key of Object.keys(TAXONOMY)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return TAXONOMY[key];
    }
  }
  return DEFAULT_PROFILE;
}

export const KNOWN_SPORTS = Object.keys(TAXONOMY);
