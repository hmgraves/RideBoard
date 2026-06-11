import { RideScheduleEntry } from "../../lib/models/ride-schedule-entry";
import { makeHorseRiderKey } from "../../lib/utils/schedule-utils";

export type ScheduleChangeType = "time-changed" | "added" | "removed";

export interface ScheduleChange {
  type: ScheduleChangeType;
  key: string;

  riderName: string;
  horseName: string;
  phase: string;

  previousEntry?: RideScheduleEntry;
  newEntry?: RideScheduleEntry;
}

export function makeRideChangeKey(entry: RideScheduleEntry): string {
  return `${makeHorseRiderKey(entry.riderName, entry.horseName)}|${entry.phase}`;
}

export function compareScheduleEntries(
  previousEntries: RideScheduleEntry[],
  newEntries: RideScheduleEntry[]
): ScheduleChange[] {
  const previousMap = new Map(
    previousEntries.map((entry) => [makeRideChangeKey(entry), entry])
  );

  const newMap = new Map(
    newEntries.map((entry) => [makeRideChangeKey(entry), entry])
  );

  const changes: ScheduleChange[] = [];

  for (const [key, newEntry] of newMap.entries()) {
    const previousEntry = previousMap.get(key);

    if (!previousEntry) {
      changes.push({
        type: "added",
        key,
        riderName: newEntry.riderName,
        horseName: newEntry.horseName,
        phase: newEntry.phase,
        newEntry,
      });

      continue;
    }

    if (previousEntry.rideDateTime !== newEntry.rideDateTime) {
      changes.push({
        type: "time-changed",
        key,
        riderName: newEntry.riderName,
        horseName: newEntry.horseName,
        phase: newEntry.phase,
        previousEntry,
        newEntry,
      });
    }
  }

  for (const [key, previousEntry] of previousMap.entries()) {
    if (!newMap.has(key)) {
      changes.push({
        type: "removed",
        key,
        riderName: previousEntry.riderName,
        horseName: previousEntry.horseName,
        phase: previousEntry.phase,
        previousEntry,
      });
    }
  }

  return changes.sort((a, b) => {
    const aTime =
      a.newEntry?.rideDateTime ?? a.previousEntry?.rideDateTime ?? "";
    const bTime =
      b.newEntry?.rideDateTime ?? b.previousEntry?.rideDateTime ?? "";

    return new Date(aTime).getTime() - new Date(bTime).getTime();
  });
}
