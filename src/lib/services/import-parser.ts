import { ImportedEntry } from "../models/imported-entry";
import {
  RidePhase,
  RideScheduleEntry,
} from "../models/ride-schedule-entry";
import {
  createStableId,
  formatDateLabel,
  formatDay,
  formatTime,
  parseRiderName,
} from "../utils/schedule-utils";

const SUPPORTED_PHASES: RidePhase[] = [
  "Dressage",
  "Cross Country",
  "Show Jumping",
];

export function parseEntries(
  rawJson: string,
  eventId: string
): RideScheduleEntry[] {
  const parsed = JSON.parse(rawJson);

  const entries: ImportedEntry[] = Array.isArray(parsed)
    ? parsed
    : parsed.entries ?? parsed.data ?? [];

  if (!Array.isArray(entries)) {
    throw new Error("Imported JSON must be an array of entries.");
  }

  return entries.flatMap((entry) => flattenEntry(entry, eventId));
}

export function flattenEntry(
  entry: ImportedEntry,
  eventId: string
): RideScheduleEntry[] {
  if (!entry.RidingDetails?.length) {
    return [];
  }

  return entry.RidingDetails
    .filter((detail) => isSupportedPhase(detail.Phase))
    .filter((detail) => Boolean(detail.RideTimes?.trim()))
    .map((detail) => {
      const rideDate = new Date(detail.RideTimes as string);

      if (Number.isNaN(rideDate.getTime())) {
        throw new Error(
          `Invalid ride time for ${entry.RiderName} / ${entry.HorseName}: ${detail.RideTimes}`
        );
      }

      const phase = detail.Phase as RidePhase;
      const venue = detail.Venues?.[0]?.venue ?? null;
      const riderParts = parseRiderName(entry.RiderName);

      const id = createStableId([
        eventId,
        entry.EntryListId,
        entry.RiderName,
        entry.HorseName,
        phase,
        detail.RideTimes,
      ]);

      return {
        id,
        eventId,

        entryListId: entry.EntryListId,
        pinnyNumber: entry.PinnyNumber,

        riderName: entry.RiderName,
        riderFirstName: riderParts.firstName,
        riderLastName: riderParts.lastName,

        horseName: entry.HorseName,
        division: entry.Division,
        divisionShortName: entry.DivisionShortName,

        phase,
        arena: venue,

        rideDateTime: rideDate.toISOString(),
        rideDateLabel: formatDateLabel(rideDate),
        rideDay: formatDay(rideDate),
        rideTime: formatTime(rideDate),

        stableWith: entry.stableWith,
        stallAssignment: entry.stallAssignment,
        tackStallAssignment: entry.tackStallAssignment,

        status: entry.Status,
      };
    });
}

function isSupportedPhase(phase: string): phase is RidePhase {
  return SUPPORTED_PHASES.includes(phase as RidePhase);
}