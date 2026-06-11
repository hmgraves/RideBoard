import { RideScheduleEntry } from "./ride-schedule-entry";
import { TeamEntry } from "./team-entry";
import { ScheduleChange } from "../services/schedule-change-service";

export interface PublishedSchedule {
  id: string;
  title: string;
  eventId: string;
  entries: RideScheduleEntry[];
  teamEntries: TeamEntry[];
  changes: ScheduleChange[];
  createdAt: string;
  updatedAt: string;
}

export interface PublishedScheduleInput {
  title: string;
  eventId: string;
  entries: RideScheduleEntry[];
  teamEntries: TeamEntry[];
  changes: ScheduleChange[];
}

export interface PublishedSchedulePublication extends PublishedSchedule {
  editToken: string;
}

export interface PublishedScheduleLink {
  shareId: string;
  editToken: string;
}

export interface PublishedScheduleSettings {
  title: string;
}
