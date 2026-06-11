"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Maximize2, Minimize2, Share2 } from "lucide-react";

import {
  filterToTeamEntries,
  groupByDay,
} from "../../lib/services/schedule-service";
import {
  makeRideChangeKey,
  ScheduleChange,
} from "../../lib/services/schedule-change-service";
import {
  useStoredScheduleEntries,
  useStoredScheduleChanges,
  useStoredTeamEntries,
} from "../../lib/hooks/use-stored-schedule-data";
import { makeHorseRiderKey } from "../../lib/utils/schedule-utils";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArenaChip, PhaseChip } from "@/components/schedule-chips";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SchedulePage() {
  const allEntries = useStoredScheduleEntries();
  const teamEntries = useStoredTeamEntries();
  const scheduleChanges = useStoredScheduleChanges();
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [publishError, setPublishError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  const teamSchedule = useMemo(() => {
    return filterToTeamEntries(allEntries, teamEntries);
  }, [allEntries, teamEntries]);

  const dayGroups = useMemo(() => {
    return groupByDay(teamSchedule);
  }, [teamSchedule]);

  const teamPairKeys = useMemo(() => {
    return new Set(
      teamEntries.map((entry) =>
        makeHorseRiderKey(entry.riderName, entry.horseName)
      )
    );
  }, [teamEntries]);

  const teamScheduleChanges = useMemo(() => {
    return scheduleChanges.filter((change) =>
      teamPairKeys.has(makeHorseRiderKey(change.riderName, change.horseName))
    );
  }, [scheduleChanges, teamPairKeys]);

  const currentChangeMap = useMemo(() => {
    return new Map(
      teamScheduleChanges
        .filter((change) => change.type !== "removed")
        .map((change) => [change.key, change])
    );
  }, [teamScheduleChanges]);

  const removedTeamChanges = useMemo(() => {
    return teamScheduleChanges.filter((change) => change.type === "removed");
  }, [teamScheduleChanges]);

  const mobileLabelClassName = cn(
    "text-xs font-medium text-muted-foreground",
    isScreenshotMode ? "hidden" : "md:hidden"
  );

  const stackedCellContentClassName = isScreenshotMode
    ? "block min-w-0"
    : "flex justify-between gap-3 md:block";

  const chipCellContentClassName = isScreenshotMode
    ? "block min-w-0"
    : "flex items-center justify-between gap-3 md:block";

  const tableHeaderClassName = isScreenshotMode
    ? "table-header-group"
    : "hidden md:table-header-group";

  const tableClassName = isScreenshotMode
    ? "table-fixed text-[11px] leading-tight"
    : undefined;

  const tableRowClassName = isScreenshotMode
    ? "table-row border-b last:border-b-0"
    : "block border-b p-4 last:border-b-0 md:table-row md:p-0";

  const tableCellClassName = isScreenshotMode
    ? "table-cell whitespace-normal px-1.5 py-1 align-top"
    : "block px-0 py-1 md:table-cell md:px-4 md:py-3";

  const compactTableCellClassName = isScreenshotMode
    ? "whitespace-normal px-1.5 py-1 align-top"
    : "px-2 py-2";

  async function publishSchedule() {
    setPublishError("");
    setIsPublishing(true);

    try {
      const response = await fetch("/api/published-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: allEntries[0]?.eventId
            ? `${allEntries[0].eventId} Team Schedule`
            : "Team Schedule",
          eventId: allEntries[0]?.eventId ?? "current-event",
          entries: allEntries,
          teamEntries,
          changes: scheduleChanges,
        }),
      });

      const data = (await response.json()) as
        | { id: string }
        | { error?: string };

      if (!response.ok || !("id" in data)) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Unable to publish schedule."
        );
      }

      const nextShareUrl = `${window.location.origin}/shared/${data.id}`;
      setShareUrl(nextShareUrl);

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(nextShareUrl);
      }
    } catch (error) {
      setPublishError(
        error instanceof Error ? error.message : "Unable to publish schedule."
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function copyShareUrl() {
    if (!shareUrl || !navigator.clipboard) return;

    await navigator.clipboard.writeText(shareUrl);
  }

  return (
    <main
      className={cn(
        "mx-auto px-4 py-6 sm:px-6 sm:py-10",
        isScreenshotMode ? "max-w-none" : "max-w-6xl"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
          isScreenshotMode ? "mb-3" : "mb-8"
        )}
      >
        <div className="space-y-2">
          <p
            className={cn(
              "text-sm font-medium text-muted-foreground",
              isScreenshotMode && "hidden"
            )}
          >
            Step 3 of 3
          </p>

          <h1
            className={cn(
              "font-bold tracking-tight",
              isScreenshotMode ? "text-xl" : "text-3xl"
            )}
          >
            Team Schedule
          </h1>

          <p
            className={cn(
              "max-w-2xl text-muted-foreground",
              isScreenshotMode && "hidden"
            )}
          >
            Your selected horse/rider pairs, grouped by day and sorted by ride
            time.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={publishSchedule}
            disabled={
              isPublishing || allEntries.length === 0 || teamEntries.length === 0
            }
          >
            <Share2 aria-hidden="true" />
            {isPublishing ? "Publishing..." : "Publish"}
          </Button>

          <Button
            type="button"
            variant={isScreenshotMode ? "default" : "outline"}
            onClick={() => setIsScreenshotMode((current) => !current)}
          >
            {isScreenshotMode ? (
              <Maximize2 aria-hidden="true" />
            ) : (
              <Minimize2 aria-hidden="true" />
            )}
            {isScreenshotMode ? "Normal View" : "Screenshot Mode"}
          </Button>

          <Link
            href="/team"
            className={cn(
              buttonVariants({ variant: "outline" }),
              isScreenshotMode && "hidden"
            )}
          >
            Edit Team
          </Link>

          <Link
            href="/import"
            className={cn(
              buttonVariants({ variant: "outline" }),
              isScreenshotMode && "hidden"
            )}
          >
            Import New Data
          </Link>
        </div>
      </div>

      {shareUrl ? (
        <Card className={cn("mb-6 print:hidden", isScreenshotMode && "hidden")}>
          <CardHeader>
            <CardTitle>Published Schedule</CardTitle>
            <CardDescription>
              This read-only link has been copied to your clipboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
            <Link
              href={shareUrl}
              className="min-w-0 flex-1 truncate rounded-md border px-3 py-2 text-sm text-muted-foreground"
            >
              {shareUrl}
            </Link>
            <Button type="button" variant="outline" onClick={copyShareUrl}>
              <Copy aria-hidden="true" />
              Copy
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {publishError ? (
        <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive print:hidden">
          {publishError}
        </div>
      ) : null}

      {teamEntries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No team selected</CardTitle>
            <CardDescription>
              Select horse/rider pairs before viewing a schedule.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Link href="/team" className={buttonVariants()}>
              Go to Team Selection
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {teamEntries.length > 0 && teamSchedule.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No matching schedule entries</CardTitle>
            <CardDescription>
              You have selected team entries, but none matched the imported
              schedule. This can happen if the imported data was cleared or if
              rider/horse names changed.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-wrap gap-2">
            <Link href="/import" className={buttonVariants()}>
              Re-import Schedule
            </Link>

            <Link
              href="/team"
              className={buttonVariants({ variant: "outline" })}
            >
              Edit Team
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {dayGroups.length > 0 ? (
        <div className={cn("grid", isScreenshotMode ? "gap-3" : "gap-6")}>
          <Card className={cn(isScreenshotMode && "hidden")}>
            <CardHeader>
              <CardTitle>Schedule Summary</CardTitle>
              <CardDescription>
                {teamEntries.length} selected horse/rider pairs with{" "}
                {teamSchedule.length} total ride entries.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Selected pairs</p>
                <p className="mt-1 text-2xl font-semibold">
                  {teamEntries.length}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Ride entries</p>
                <p className="mt-1 text-2xl font-semibold">
                  {teamSchedule.length}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Days</p>
                <p className="mt-1 text-2xl font-semibold">
                  {dayGroups.length}
                </p>
              </div>
            </CardContent>
          </Card>

          {teamScheduleChanges.length > 0 ? (
            <Card size={isScreenshotMode ? "sm" : "default"}>
              <CardHeader className={cn(isScreenshotMode && "px-2")}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle
                      className={cn(isScreenshotMode && "text-sm leading-none")}
                    >
                      Schedule Changes
                    </CardTitle>
                    <CardDescription
                      className={cn(isScreenshotMode && "text-xs")}
                    >
                      Changes from the most recent import that affect your
                      selected team.
                    </CardDescription>
                  </div>

                  <Badge variant="outline">{teamScheduleChanges.length}</Badge>
                </div>
              </CardHeader>

              <CardContent
                className={cn(
                  "grid gap-3 sm:grid-cols-3",
                  isScreenshotMode && "px-2 text-xs"
                )}
              >
                <ChangeCount
                  label="Moved"
                  count={
                    teamScheduleChanges.filter(
                      (change) => change.type === "time-changed"
                    ).length
                  }
                />
                <ChangeCount
                  label="New"
                  count={
                    teamScheduleChanges.filter(
                      (change) => change.type === "added"
                    ).length
                  }
                />
                <ChangeCount label="Removed" count={removedTeamChanges.length} />
              </CardContent>
            </Card>
          ) : null}

          {removedTeamChanges.length > 0 ? (
            <Card size={isScreenshotMode ? "sm" : "default"}>
              <CardHeader className={cn(isScreenshotMode && "px-2")}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle
                      className={cn(isScreenshotMode && "text-sm leading-none")}
                    >
                      Removed Rides
                    </CardTitle>
                    <CardDescription
                      className={cn(isScreenshotMode && "text-xs")}
                    >
                      These team rides were present in the previous import but
                      are not in the current schedule.
                    </CardDescription>
                  </div>

                  <Badge variant="destructive">
                    {removedTeamChanges.length}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className={cn(isScreenshotMode && "px-2")}>
                <div className="rounded-md border">
                  <Table
                    className={
                      isScreenshotMode
                        ? "table-fixed text-[11px] leading-tight"
                        : undefined
                    }
                  >
                    <TableHeader>
                      <TableRow>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Time
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Rider
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Horse
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Phase
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Arena
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {removedTeamChanges.map((change) => (
                        <TableRow key={change.key} className="bg-red-50/60">
                          <TableCell className={compactTableCellClassName}>
                            <div className="font-semibold">
                              {change.previousEntry?.rideTime ?? "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {change.previousEntry?.rideDateLabel}
                            </div>
                          </TableCell>
                          <TableCell className={compactTableCellClassName}>
                            {change.riderName}
                          </TableCell>
                          <TableCell className={compactTableCellClassName}>
                            {change.horseName}
                          </TableCell>
                          <TableCell className={compactTableCellClassName}>
                            <PhaseChip
                              phase={change.phase}
                              className={cn(
                                isScreenshotMode &&
                                  "h-auto px-1 py-0 text-[10px] leading-tight"
                              )}
                            />
                          </TableCell>
                          <TableCell className={compactTableCellClassName}>
                            <ArenaChip
                              arena={change.previousEntry?.arena ?? null}
                              className={cn(
                                isScreenshotMode &&
                                  "h-auto px-1 py-0 text-[10px] leading-tight"
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {dayGroups.map((group) => (
            <Card
              key={group.dateLabel}
              size={isScreenshotMode ? "sm" : "default"}
              className="overflow-hidden"
            >
              <CardHeader className={cn(isScreenshotMode && "px-2")}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle
                      className={cn(isScreenshotMode && "text-sm leading-none")}
                    >
                      {group.dateLabel}
                    </CardTitle>
                    <CardDescription
                      className={cn(isScreenshotMode && "text-xs")}
                    >
                      {group.entries.length} scheduled ride
                      {group.entries.length === 1 ? "" : "s"}
                    </CardDescription>
                  </div>

                  <Badge variant="outline">{group.day}</Badge>
                </div>
              </CardHeader>

              <CardContent className={cn(isScreenshotMode && "px-2")}>
                <div className="rounded-md border">
                  <Table className={tableClassName}>
                    <TableHeader className={tableHeaderClassName}>
                      <TableRow>
                        <TableHead
                          className={cn(
                            "w-[110px]",
                            isScreenshotMode && "h-7 w-[62px] px-1.5"
                          )}
                        >
                          Time
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Rider
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Horse
                        </TableHead>
                        <TableHead
                          className={cn(
                            isScreenshotMode && "h-7 w-[96px] px-1.5"
                          )}
                        >
                          Phase
                        </TableHead>
                        <TableHead
                          className={cn(
                            isScreenshotMode && "h-7 w-[48px] px-1.5"
                          )}
                        >
                          Arena
                        </TableHead>
                        <TableHead
                          className={cn(isScreenshotMode && "h-7 px-1.5")}
                        >
                          Division
                        </TableHead>
                        <TableHead
                          className={cn(
                            isScreenshotMode && "h-7 w-[50px] px-1.5"
                          )}
                        >
                          Pinny
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {group.entries.map((entry) => {
                        const change = currentChangeMap.get(
                          makeRideChangeKey(entry)
                        );

                        return (
                          <TableRow
                            key={entry.id}
                            className={cn(
                              tableRowClassName,
                              change?.type === "added" && "bg-green-50/70",
                              change?.type === "time-changed" &&
                                "bg-amber-50/70"
                            )}
                          >
                            <TableCell className={tableCellClassName}>
                              <div className={stackedCellContentClassName}>
                                <span className={mobileLabelClassName}>
                                  Time
                                </span>
                                <div
                                  className={cn(
                                    "text-right md:text-left",
                                    isScreenshotMode && "text-left"
                                  )}
                                >
                                  <div className="flex items-center justify-end gap-1 md:justify-start">
                                    <span className="font-semibold">
                                      {entry.rideTime}
                                    </span>
                                    {change ? (
                                      <ChangeBadge
                                        change={change}
                                        isCompact={isScreenshotMode}
                                      />
                                    ) : null}
                                  </div>
                                  {change?.type === "time-changed" ? (
                                    <div className="text-xs text-muted-foreground">
                                      was {change.previousEntry?.rideTime}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className={tableCellClassName}>
                              <div className={stackedCellContentClassName}>
                                <span className={mobileLabelClassName}>
                                  Rider
                                </span>
                                <span
                                  className={cn(
                                    "text-right md:text-left",
                                    isScreenshotMode &&
                                      "block truncate text-left"
                                  )}
                                >
                                  {entry.riderName}
                                </span>
                              </div>
                            </TableCell>

                          <TableCell className={tableCellClassName}>
                            <div className={stackedCellContentClassName}>
                              <span className={mobileLabelClassName}>
                                Horse
                              </span>
                              <span
                                className={cn(
                                  "text-right font-medium md:text-left",
                                  isScreenshotMode &&
                                    "block truncate text-left"
                                )}
                              >
                                {entry.horseName}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className={tableCellClassName}>
                            <div className={chipCellContentClassName}>
                              <span className={mobileLabelClassName}>
                                Phase
                              </span>
                              <PhaseChip
                                phase={entry.phase}
                                className={cn(
                                  isScreenshotMode &&
                                    "h-auto px-1 py-0 text-[10px] leading-tight"
                                )}
                              />
                            </div>
                          </TableCell>

                          <TableCell className={tableCellClassName}>
                            <div className={chipCellContentClassName}>
                              <span className={mobileLabelClassName}>
                                Arena
                              </span>
                              <ArenaChip
                                arena={entry.arena}
                                className={cn(
                                  isScreenshotMode &&
                                    "h-auto px-1 py-0 text-[10px] leading-tight"
                                )}
                              />
                            </div>
                          </TableCell>

                          <TableCell className={tableCellClassName}>
                            <div className={stackedCellContentClassName}>
                              <span className={mobileLabelClassName}>
                                Division
                              </span>
                              <span
                                className={cn(
                                  "text-right md:text-left",
                                  isScreenshotMode &&
                                    "block truncate text-left"
                                )}
                              >
                                {entry.division}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className={tableCellClassName}>
                            <div className={stackedCellContentClassName}>
                              <span className={mobileLabelClassName}>
                                Pinny
                              </span>
                              <span>{entry.pinnyNumber ?? "—"}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </main>
  );
}

function ChangeCount({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-semibold">{count}</p>
    </div>
  );
}

function ChangeBadge({
  change,
  isCompact,
}: {
  change: ScheduleChange;
  isCompact: boolean;
}) {
  if (change.type === "added") {
    return (
      <Badge
        className={cn(
          "border-green-200 bg-green-100 text-green-800 hover:bg-green-100",
          isCompact && "px-1 py-0 text-[10px] leading-tight"
        )}
      >
        New
      </Badge>
    );
  }

  return (
    <Badge
      className={cn(
        "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100",
        isCompact && "px-1 py-0 text-[10px] leading-tight"
      )}
    >
      Moved
    </Badge>
  );
}
