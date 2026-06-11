import { RideScheduleEntry } from "../../lib/models/ride-schedule-entry";
import { TeamEntry } from "../../lib/models/team-entry";
import { PublishedScheduleLink } from "../models/published-schedule";
import { ScheduleChange } from "./schedule-change-service";

const SCHEDULE_KEY = "trainer-schedule.entries";
const TEAM_KEY = "trainer-schedule.team";
const CHANGES_KEY = "trainer-schedule.changes";
const PUBLISHED_LINK_KEY = "trainer-schedule.published-link";
const STORAGE_CHANGE_EVENT = "trainer-schedule-storage";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

function notifyStorageChanged(): void {
  if (!isBrowser()) return;

  window.dispatchEvent(new Event(STORAGE_CHANGE_EVENT));
}

export function saveScheduleEntries(entries: RideScheduleEntry[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(entries));
  notifyStorageChanged();
}

export function getScheduleEntries(): RideScheduleEntry[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(SCHEDULE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveTeamEntries(entries: TeamEntry[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(TEAM_KEY, JSON.stringify(entries));
  notifyStorageChanged();
}

export function getTeamEntries(): TeamEntry[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(TEAM_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveScheduleChanges(changes: ScheduleChange[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(CHANGES_KEY, JSON.stringify(changes));
  notifyStorageChanged();
}

export function getScheduleChanges(): ScheduleChange[] {
  if (!isBrowser()) return [];

  const raw = localStorage.getItem(CHANGES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePublishedScheduleLink(link: PublishedScheduleLink): void {
  if (!isBrowser()) return;

  localStorage.setItem(PUBLISHED_LINK_KEY, JSON.stringify(link));
  notifyStorageChanged();
}

export function getPublishedScheduleLink(): PublishedScheduleLink | null {
  if (!isBrowser()) return null;

  const raw = localStorage.getItem(PUBLISHED_LINK_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAllScheduleData(): void {
  if (!isBrowser()) return;

  localStorage.removeItem(SCHEDULE_KEY);
  localStorage.removeItem(TEAM_KEY);
  localStorage.removeItem(CHANGES_KEY);
  localStorage.removeItem(PUBLISHED_LINK_KEY);
  notifyStorageChanged();
}
