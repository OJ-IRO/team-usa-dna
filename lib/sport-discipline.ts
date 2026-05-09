// Derive a sub-discipline tag from a cluster's representative events.
// Keeps cluster labels specific (e.g. "Athletics (Sprints)") without
// requiring an external taxonomy.

type Rule = { match: RegExp; label: string };

const RULES: Record<string, Rule[]> = {
  Athletics: [
    { match: /pole vault|high jump|long jump|triple jump|jump/i, label: "Jumps" },
    { match: /shot put|discus|javelin|hammer|throw/i, label: "Throws" },
    { match: /decathlon|heptathlon|pentathlon|combined/i, label: "Combined Events" },
    { match: /marathon|10,?000|10km|5,?000|3,?000 steeplechase|cross-country/i, label: "Distance" },
    { match: /1,?500|800|metres? hurdles|hurdles|400 metres|400m/i, label: "Middle / Hurdles" },
    { match: /100 metres|200 metres|relay|sprint|60 metres/i, label: "Sprints" },
    { match: /walk/i, label: "Race Walk" },
  ],
  Swimming: [
    { match: /relay/i, label: "Relay" }, // 4x100 should categorize as relay, not freestyle
    { match: /1500|1,?500|800 metres freestyle|distance/i, label: "Distance" },
    { match: /50 metres? freestyle|100 metres? freestyle|sprint/i, label: "Sprints" },
    { match: /butterfly/i, label: "Butterfly" },
    { match: /backstroke/i, label: "Backstroke" },
    { match: /breaststroke/i, label: "Breaststroke" },
    { match: /individual medley|medley/i, label: "Medley" },
  ],
  Cycling: [
    { match: /road race|time trial|individual road/i, label: "Road" },
    { match: /track|sprint|kilo|pursuit|keirin|madison|points race/i, label: "Track" },
    { match: /mountain bike|cross-country/i, label: "Mountain" },
    { match: /bmx/i, label: "BMX" },
  ],
  Canoeing: [
    { match: /^k\d|kayak|k-1|k-2|k-4/i, label: "Kayak" },
    { match: /^c\d|canadian|c-1|c-2|c-4/i, label: "Sprint Canoe" },
    { match: /slalom/i, label: "Slalom" },
  ],
  Rowing: [
    { match: /single sculls|sculls/i, label: "Sculls" },
    { match: /pair|four|eight|sweep|coxed|coxless/i, label: "Sweep" },
    { match: /lightweight/i, label: "Lightweight" },
  ],
  Wrestling: [
    { match: /freestyle/i, label: "Freestyle" },
    { match: /greco/i, label: "Greco-Roman" },
  ],
  Gymnastics: [
    { match: /rhythmic/i, label: "Rhythmic" },
    { match: /trampoline/i, label: "Trampoline" },
    { match: /artistic|all-around|vault|uneven|beam|floor|rings|parallel|horizontal|pommel/i, label: "Artistic" },
  ],
  Shooting: [
    { match: /trap|skeet/i, label: "Shotgun" },
    { match: /pistol/i, label: "Pistol" },
    { match: /rifle|small-bore|free rifle|running target/i, label: "Rifle" },
  ],
  "Equestrianism": [
    { match: /dressage/i, label: "Dressage" },
    { match: /jumping|show-?jumping/i, label: "Show Jumping" },
    { match: /eventing|three-day/i, label: "Eventing" },
  ],
  "Speed Skating": [
    { match: /500 metres|short/i, label: "Sprint" },
    { match: /5,?000|10,?000|distance/i, label: "Distance" },
  ],
  "Alpine Skiing": [
    { match: /downhill|super-?g/i, label: "Speed" },
    { match: /slalom|giant/i, label: "Technical" },
    { match: /combined/i, label: "Combined" },
  ],
  "Sailing": [
    { match: /windsurf/i, label: "Windsurfer" },
    { match: /soling|star|finn|laser|470|49er|nacra/i, label: "Dinghy / Keelboat" },
  ],
  "Para Athletics": [
    { match: /wheelchair|^t5\d|^t3\d/i, label: "Wheelchair" },
    { match: /long jump|high jump|triple jump|jump/i, label: "Jumps" },
    { match: /shot put|discus|javelin|throw/i, label: "Throws" },
    { match: /marathon|5,?000|distance/i, label: "Distance" },
    { match: /100m|200m|400m|sprint/i, label: "Sprints" },
  ],
  "Para Swimming": [
    { match: /freestyle/i, label: "Freestyle" },
    { match: /butterfly/i, label: "Butterfly" },
    { match: /backstroke/i, label: "Backstroke" },
    { match: /breaststroke/i, label: "Breaststroke" },
    { match: /medley/i, label: "Medley" },
  ],
};

export function disciplineForCluster(sport: string, events: string[]): string | null {
  const rules = RULES[sport];
  if (!rules || events.length === 0) return null;
  const counts = new Map<string, number>();
  for (const event of events) {
    for (const rule of rules) {
      if (rule.match.test(event)) {
        counts.set(rule.label, (counts.get(rule.label) || 0) + 1);
        break;
      }
    }
  }
  if (counts.size === 0) return null;
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  return top[0];
}

export function clusterDisplaySport(sport: string, events: string[]): string {
  const discipline = disciplineForCluster(sport, events);
  return discipline ? `${sport} (${discipline})` : sport;
}
