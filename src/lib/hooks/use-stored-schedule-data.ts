"use client";

import { useSyncExternalStore } from "react";

import { RideScheduleEntry } from "../models/ride-schedule-entry";
import { TeamEntry } from "../models/team-entry";
import {
  PublishedScheduleLink,
  PublishedScheduleSettings,
} from "../models/published-schedule";
import { ScheduleChange } from "../services/schedule-change-service";

const SCHEDULE_KEY = "trainer-schedule.entries";
const TEAM_KEY = "trainer-schedule.team";
const CHANGES_KEY = "trainer-schedule.changes";
const PUBLISHED_LINK_KEY = "trainer-schedule.published-link";
const PUBLISHED_SETTINGS_KEY = "trainer-schedule.published-settings";
const STORAGE_CHANGE_EVENT = "trainer-schedule-storage";

const EMPTY_SCHEDULE_ENTRIES: RideScheduleEntry[] = [];
const EMPTY_TEAM_ENTRIES: TeamEntry[] = [];
const EMPTY_SCHEDULE_CHANGES: ScheduleChange[] = [];

let scheduleCacheRaw: string | null | undefined;
let scheduleCacheValue: RideScheduleEntry[] = EMPTY_SCHEDULE_ENTRIES;
let teamCacheRaw: string | null | undefined;
let teamCacheValue: TeamEntry[] = EMPTY_TEAM_ENTRIES;
let changesCacheRaw: string | null | undefined;
let changesCacheValue: ScheduleChange[] = EMPTY_SCHEDULE_CHANGES;
let publishedLinkCacheRaw: string | null | undefined;
let publishedLinkCacheValue: PublishedScheduleLink | null = null;
let publishedSettingsCacheRaw: string | null | undefined;
let publishedSettingsCacheValue: PublishedScheduleSettings = { title: "" };

function subscribeToStoredData(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_CHANGE_EVENT, onStoreChange);
  };
}

function readScheduleEntries(): RideScheduleEntry[] {
  const raw = window.localStorage.getItem(SCHEDULE_KEY);

  if (!raw) {
    scheduleCacheRaw = raw;
    scheduleCacheValue = EMPTY_SCHEDULE_ENTRIES;
    return scheduleCacheValue;
  }

  if (raw === scheduleCacheRaw) {
    return scheduleCacheValue;
  }

  scheduleCacheRaw = raw;
  scheduleCacheValue = JSON.parse(raw);
  return scheduleCacheValue;
}

function readTeamEntries(): TeamEntry[] {
  const raw = window.localStorage.getItem(TEAM_KEY);

  if (!raw) {
    teamCacheRaw = raw;
    teamCacheValue = EMPTY_TEAM_ENTRIES;
    return teamCacheValue;
  }

  if (raw === teamCacheRaw) {
    return teamCacheValue;
  }

  teamCacheRaw = raw;
  teamCacheValue = JSON.parse(raw);
  return teamCacheValue;
}

function readScheduleChanges(): ScheduleChange[] {
  const raw = window.localStorage.getItem(CHANGES_KEY);

  if (!raw) {
    changesCacheRaw = raw;
    changesCacheValue = EMPTY_SCHEDULE_CHANGES;
    return changesCacheValue;
  }

  if (raw === changesCacheRaw) {
    return changesCacheValue;
  }

  changesCacheRaw = raw;
  changesCacheValue = JSON.parse(raw);
  return changesCacheValue;
}

function readPublishedScheduleLink(): PublishedScheduleLink | null {
  const raw = window.localStorage.getItem(PUBLISHED_LINK_KEY);

  if (!raw) {
    publishedLinkCacheRaw = raw;
    publishedLinkCacheValue = null;
    return publishedLinkCacheValue;
  }

  if (raw === publishedLinkCacheRaw) {
    return publishedLinkCacheValue;
  }

  publishedLinkCacheRaw = raw;
  publishedLinkCacheValue = JSON.parse(raw);
  return publishedLinkCacheValue;
}

function readPublishedScheduleSettings(): PublishedScheduleSettings {
  const raw = window.localStorage.getItem(PUBLISHED_SETTINGS_KEY);

  if (!raw) {
    publishedSettingsCacheRaw = raw;
    publishedSettingsCacheValue = { title: "" };
    return publishedSettingsCacheValue;
  }

  if (raw === publishedSettingsCacheRaw) {
    return publishedSettingsCacheValue;
  }

  publishedSettingsCacheRaw = raw;
  publishedSettingsCacheValue = JSON.parse(raw);
  return publishedSettingsCacheValue;
}

export function useStoredScheduleEntries() {
  return useSyncExternalStore(
    subscribeToStoredData,
    readScheduleEntries,
    () => EMPTY_SCHEDULE_ENTRIES
  );
}

export function useStoredTeamEntries() {
  return useSyncExternalStore(
    subscribeToStoredData,
    readTeamEntries,
    () => EMPTY_TEAM_ENTRIES
  );
}

export function useStoredScheduleChanges() {
  return useSyncExternalStore(
    subscribeToStoredData,
    readScheduleChanges,
    () => EMPTY_SCHEDULE_CHANGES
  );
}

export function useStoredPublishedScheduleLink() {
  return useSyncExternalStore(
    subscribeToStoredData,
    readPublishedScheduleLink,
    () => null
  );
}

export function useStoredPublishedScheduleSettings() {
  return useSyncExternalStore(
    subscribeToStoredData,
    readPublishedScheduleSettings,
    () => ({ title: "" })
  );
}
