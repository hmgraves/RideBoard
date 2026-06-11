export type RidePhase = "Dressage" | "Cross Country" | "Show Jumping";

export interface RideScheduleEntry {
  id: string;
  eventId: string;

  entryListId: number;
  pinnyNumber: number | null;

  riderName: string;
  riderFirstName?: string;
  riderLastName?: string;

  horseName: string;
  division: string;
  divisionShortName?: string;

  phase: RidePhase;
  arena: string | null;

  rideDateTime: string;
  rideDateLabel: string;
  rideDay: string;
  rideTime: string;

  stableWith?: string | null;
  stallAssignment?: string | null;
  tackStallAssignment?: string | null;

  status?: string;
}