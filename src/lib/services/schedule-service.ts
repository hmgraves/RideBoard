import { TeamEntry } from "../models/team-entry";
import { makeHorseRiderKey } from "../utils/schedule-utils";
import { RideScheduleEntry } from "../models/ride-schedule-entry";

export interface ScheduleDayGroup {
  day: string;
  dateLabel: string;
  entries: RideScheduleEntry[];
}

export function filterToTeamEntries(
  scheduleEntries: RideScheduleEntry[],
  teamEntries: TeamEntry[]
): RideScheduleEntry[] {
  const teamKeys = new Set(
    teamEntries.map((entry) =>
      makeHorseRiderKey(entry.riderName, entry.horseName)
    )
  );

  return scheduleEntries.filter((entry) =>
    teamKeys.has(makeHorseRiderKey(entry.riderName, entry.horseName))
  );
}

export function groupByDay(entries: RideScheduleEntry[]): ScheduleDayGroup[] {
  const sorted = [...entries].sort((a, b) => {
    return (
      new Date(a.rideDateTime).getTime() -
      new Date(b.rideDateTime).getTime()
    );
  });

  const groups = new Map<string, RideScheduleEntry[]>();

  for (const entry of sorted) {
    const key = entry.rideDateLabel;

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key)!.push(entry);
  }

  return Array.from(groups.entries()).map(([dateLabel, dayEntries]) => ({
    day: dayEntries[0]?.rideDay ?? "",
    dateLabel,
    entries: dayEntries,
  }));
}

export function getUniqueHorseRiderPairs(entries: RideScheduleEntry[]) {
  const map = new Map<string, RideScheduleEntry>();

  for (const entry of entries) {
    const key = makeHorseRiderKey(entry.riderName, entry.horseName);

    if (!map.has(key)) {
      map.set(key, entry);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const riderCompare = a.riderName.localeCompare(b.riderName);
    if (riderCompare !== 0) return riderCompare;

    return a.horseName.localeCompare(b.horseName);
  });
}

export function validatePhaseCounts(entries: RideScheduleEntry[]) {
  const horseMap = new Map<
    string,
    {
      riderName: string;
      horseName: string;
      dressage: number;
      crossCountry: number;
      showJumping: number;
      total: number;
    }
  >();

  for (const entry of entries) {
    const key = makeHorseRiderKey(entry.riderName, entry.horseName);

    if (!horseMap.has(key)) {
      horseMap.set(key, {
        riderName: entry.riderName,
        horseName: entry.horseName,
        dressage: 0,
        crossCountry: 0,
        showJumping: 0,
        total: 0,
      });
    }

    const record = horseMap.get(key)!;

    if (entry.phase === "Dressage") record.dressage++;
    if (entry.phase === "Cross Country") record.crossCountry++;
    if (entry.phase === "Show Jumping") record.showJumping++;

    record.total++;
  }

  return Array.from(horseMap.values()).map((record) => ({
    ...record,
    isComplete:
      record.dressage === 1 &&
      record.crossCountry === 1 &&
      record.showJumping === 1 &&
      record.total === 3,
  }));
}