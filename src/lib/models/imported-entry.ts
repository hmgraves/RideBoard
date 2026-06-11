export interface ImportedEntry {
  requirementCheck?: RequirementCheck;
  stableWith?: string | null;
  stallAssignment?: string | null;
  tackStallAssignment?: string | null;

  EntryListId: number;
  PinnyNumber: number | null;

  RiderName: string;
  HorseName: string;

  Balance?: number;
  Stabling?: boolean;
  Status?: string;

  Division: string;
  DivisionShortName?: string;
  LevelType?: string;

  RidingDetails: ImportedRidingDetail[];

  EntryNote?: string | null;
  DeficiencyFlag?: boolean;
  BalanceType?: string | null;
}

export interface RequirementCheck {
  coggins?: boolean;
  ridersign?: boolean;
  ownersign?: boolean;
  trainersign?: boolean;
  parentsign?: boolean;
  coachsign?: boolean;
  minor?: boolean;
}

export interface ImportedRidingDetail {
  Phase: string;
  Venues?: ImportedVenue[];
  RideTimes?: string;
}

export interface ImportedVenue {
  venue?: string | null;
  ordinal?: string;
  date?: string;
  time?: string;
}