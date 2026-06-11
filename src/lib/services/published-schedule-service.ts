import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  PublishedSchedule,
  PublishedScheduleInput,
} from "../models/published-schedule";

type SupabasePublishedScheduleRow = {
  id: string;
  title: string;
  event_id: string;
  entries: PublishedSchedule["entries"];
  team_entries: PublishedSchedule["teamEntries"];
  changes: PublishedSchedule["changes"];
  created_at: string;
  updated_at: string;
};

const LOCAL_STORE_DIR = path.join(process.cwd(), "data", "published-schedules");

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return {
    restUrl: `${url.replace(/\/$/, "")}/rest/v1/published_schedules`,
    serviceRoleKey,
  };
}

function canUseLocalStore() {
  return process.env.NODE_ENV !== "production";
}

function toPublishedSchedule(row: SupabasePublishedScheduleRow): PublishedSchedule {
  return {
    id: row.id,
    title: row.title,
    eventId: row.event_id,
    entries: row.entries,
    teamEntries: row.team_entries,
    changes: row.changes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSupabaseRow(schedule: PublishedSchedule): SupabasePublishedScheduleRow {
  return {
    id: schedule.id,
    title: schedule.title,
    event_id: schedule.eventId,
    entries: schedule.entries,
    team_entries: schedule.teamEntries,
    changes: schedule.changes,
    created_at: schedule.createdAt,
    updated_at: schedule.updatedAt,
  };
}

async function getResponseErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  const detail = await response.text();

  if (!detail) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(detail) as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };

    return [parsed.message, parsed.details, parsed.hint, parsed.code]
      .filter(Boolean)
      .join(" ");
  } catch {
    return detail;
  }
}

export async function createPublishedSchedule(
  input: PublishedScheduleInput
): Promise<PublishedSchedule> {
  const now = new Date().toISOString();
  const schedule: PublishedSchedule = {
    ...input,
    id: randomUUID().slice(0, 8),
    title: input.title.trim() || "Team Schedule",
    createdAt: now,
    updatedAt: now,
  };

  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    const response = await fetch(supabaseConfig.restUrl, {
      method: "POST",
      headers: {
        apikey: supabaseConfig.serviceRoleKey,
        Authorization: `Bearer ${supabaseConfig.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(toSupabaseRow(schedule)),
    });

    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(response, "Unable to publish schedule.")
      );
    }

    const rows = (await response.json()) as SupabasePublishedScheduleRow[];

    if (!rows[0]) {
      throw new Error("Supabase did not return the published schedule.");
    }

    return toPublishedSchedule(rows[0]);
  }

  if (!canUseLocalStore()) {
    throw new Error("Publishing storage is not configured.");
  }

  await mkdir(LOCAL_STORE_DIR, { recursive: true });
  await writeFile(
    path.join(LOCAL_STORE_DIR, `${schedule.id}.json`),
    JSON.stringify(schedule, null, 2)
  );

  return schedule;
}

export async function getPublishedSchedule(
  id: string
): Promise<PublishedSchedule | null> {
  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    const url = new URL(supabaseConfig.restUrl);
    url.searchParams.set("id", `eq.${id}`);
    url.searchParams.set("select", "*");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        apikey: supabaseConfig.serviceRoleKey,
        Authorization: `Bearer ${supabaseConfig.serviceRoleKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(
          response,
          "Unable to load published schedule."
        )
      );
    }

    const rows = (await response.json()) as SupabasePublishedScheduleRow[];
    return rows[0] ? toPublishedSchedule(rows[0]) : null;
  }

  if (!canUseLocalStore()) {
    throw new Error("Publishing storage is not configured.");
  }

  try {
    const raw = await readFile(path.join(LOCAL_STORE_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as PublishedSchedule;
  } catch {
    return null;
  }
}
