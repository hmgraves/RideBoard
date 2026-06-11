import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  PublishedSchedule,
  PublishedScheduleInput,
  PublishedSchedulePublication,
} from "../models/published-schedule";

type SupabasePublishedScheduleRow = {
  id: string;
  title: string;
  event_id: string;
  entries: PublishedSchedule["entries"];
  team_entries: PublishedSchedule["teamEntries"];
  changes: PublishedSchedule["changes"];
  edit_token: string;
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
    edit_token: "editToken" in schedule ? String(schedule.editToken) : "",
    created_at: schedule.createdAt,
    updated_at: schedule.updatedAt,
  };
}

function toSupabaseUpdateRow(
  schedule: PublishedScheduleInput & { updatedAt: string }
) {
  return {
    title: schedule.title.trim() || "Team Schedule",
    event_id: schedule.eventId,
    entries: schedule.entries,
    team_entries: schedule.teamEntries,
    changes: schedule.changes,
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
): Promise<PublishedSchedulePublication> {
  const now = new Date().toISOString();
  const schedule: PublishedSchedulePublication = {
    ...input,
    id: randomUUID().slice(0, 8),
    editToken: randomUUID(),
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

    return {
      ...toPublishedSchedule(rows[0]),
      editToken: rows[0].edit_token,
    };
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

export async function updatePublishedSchedule(
  id: string,
  editToken: string,
  input: PublishedScheduleInput
): Promise<PublishedSchedule> {
  const updatedAt = new Date().toISOString();
  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    const url = new URL(supabaseConfig.restUrl);
    url.searchParams.set("id", `eq.${id}`);
    url.searchParams.set("edit_token", `eq.${editToken}`);

    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        apikey: supabaseConfig.serviceRoleKey,
        Authorization: `Bearer ${supabaseConfig.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(toSupabaseUpdateRow({ ...input, updatedAt })),
    });

    if (!response.ok) {
      throw new Error(
        await getResponseErrorMessage(response, "Unable to update schedule.")
      );
    }

    const rows = (await response.json()) as SupabasePublishedScheduleRow[];

    if (!rows[0]) {
      throw new Error("This browser is not allowed to update that schedule.");
    }

    return toPublishedSchedule(rows[0]);
  }

  if (!canUseLocalStore()) {
    throw new Error("Publishing storage is not configured.");
  }

  const existing = await readLocalPublishedSchedule(id);

  if (!existing || existing.editToken !== editToken) {
    throw new Error("This browser is not allowed to update that schedule.");
  }

  const nextSchedule: PublishedSchedulePublication = {
    ...existing,
    ...input,
    title: input.title.trim() || "Team Schedule",
    updatedAt,
  };

  await writeLocalPublishedSchedule(nextSchedule);

  return nextSchedule;
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

  const localSchedule = await readLocalPublishedSchedule(id);
  return localSchedule ? toPublishedScheduleFromLocal(localSchedule) : null;
}

async function readLocalPublishedSchedule(
  id: string
): Promise<PublishedSchedulePublication | null> {
  try {
    const raw = await readFile(path.join(LOCAL_STORE_DIR, `${id}.json`), "utf8");
    return JSON.parse(raw) as PublishedSchedulePublication;
  } catch {
    return null;
  }
}

async function writeLocalPublishedSchedule(
  schedule: PublishedSchedulePublication
) {
  await mkdir(LOCAL_STORE_DIR, { recursive: true });
  await writeFile(
    path.join(LOCAL_STORE_DIR, `${schedule.id}.json`),
    JSON.stringify(schedule, null, 2)
  );
}

function toPublishedScheduleFromLocal(
  schedule: PublishedSchedulePublication
): PublishedSchedule {
  return {
    id: schedule.id,
    title: schedule.title,
    eventId: schedule.eventId,
    entries: schedule.entries,
    teamEntries: schedule.teamEntries,
    changes: schedule.changes,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
  };
}
