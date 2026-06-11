import Link from "next/link";
import { notFound } from "next/navigation";

import { ArenaChip, PhaseChip } from "@/components/schedule-chips";
import { LocalPublishedTime } from "@/components/local-published-time";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPublishedSchedule } from "../../../lib/services/published-schedule-service";
import {
  filterToTeamEntries,
  groupByDay,
} from "../../../lib/services/schedule-service";
import { makeRideChangeKey } from "../../../lib/services/schedule-change-service";

export default async function SharedSchedulePage({
  params,
}: {
  params: Promise<{ shareId: string }>;
}) {
  const { shareId } = await params;
  const publishedSchedule = await getPublishedSchedule(shareId);

  if (!publishedSchedule) {
    notFound();
  }

  const teamSchedule = filterToTeamEntries(
    publishedSchedule.entries,
    publishedSchedule.teamEntries
  );
  const dayGroups = groupByDay(teamSchedule);
  const currentChangeMap = new Map(
    publishedSchedule.changes
      .filter((change) => change.type !== "removed")
      .map((change) => [change.key, change])
  );
  const removedChanges = publishedSchedule.changes.filter(
    (change) => change.type === "removed"
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Shared Schedule
          </p>
          <h1 className="text-3xl font-bold tracking-tight">
            {publishedSchedule.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Published <LocalPublishedTime isoDate={publishedSchedule.updatedAt} />.
          </p>
        </div>

        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Open App
        </Link>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Schedule Summary</CardTitle>
            <CardDescription>
              {publishedSchedule.teamEntries.length} selected horse/rider pairs
              with {teamSchedule.length} ride entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <SummaryItem label="Selected pairs" value={publishedSchedule.teamEntries.length} />
            <SummaryItem label="Ride entries" value={teamSchedule.length} />
            <SummaryItem label="Changes" value={publishedSchedule.changes.length} />
          </CardContent>
        </Card>

        {removedChanges.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Removed Rides</CardTitle>
                <Badge variant="destructive">{removedChanges.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Arena</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {removedChanges.map((change) => (
                      <TableRow key={change.key} className="bg-red-50/60">
                        <TableCell>
                          <div className="font-semibold">
                            {change.previousEntry?.rideTime ?? "-"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {change.previousEntry?.rideDateLabel}
                          </div>
                        </TableCell>
                        <TableCell>{change.riderName}</TableCell>
                        <TableCell>{change.horseName}</TableCell>
                        <TableCell>
                          <PhaseChip phase={change.phase} />
                        </TableCell>
                        <TableCell>
                          <ArenaChip arena={change.previousEntry?.arena ?? null} />
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
          <Card key={group.dateLabel} className="overflow-hidden">
            <CardHeader>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{group.dateLabel}</CardTitle>
                  <CardDescription>
                    {group.entries.length} scheduled ride
                    {group.entries.length === 1 ? "" : "s"}
                  </CardDescription>
                </div>
                <Badge variant="outline">{group.day}</Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="hidden md:table-header-group">
                    <TableRow>
                      <TableHead className="w-[110px]">Time</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead>Phase</TableHead>
                      <TableHead>Arena</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Pinny</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.entries.map((entry) => {
                      const change = currentChangeMap.get(makeRideChangeKey(entry));

                      return (
                        <TableRow
                          key={entry.id}
                          className={
                            change?.type === "added"
                              ? "block border-b bg-green-50/70 p-4 md:table-row md:p-0"
                              : change?.type === "time-changed"
                                ? "block border-b bg-amber-50/70 p-4 md:table-row md:p-0"
                                : "block border-b p-4 md:table-row md:p-0"
                          }
                        >
                          <MobileCell label="Time">
                            <div className="text-right md:text-left">
                              <div className="flex items-center justify-end gap-1 md:justify-start">
                                <span className="font-semibold">
                                  {entry.rideTime}
                                </span>
                                {change ? (
                                  <Badge
                                    className={
                                      change.type === "added"
                                        ? "border-green-200 bg-green-100 text-green-800 hover:bg-green-100"
                                        : "border-amber-200 bg-amber-100 text-amber-800 hover:bg-amber-100"
                                    }
                                  >
                                    {change.type === "added" ? "New" : "Moved"}
                                  </Badge>
                                ) : null}
                              </div>
                              {change?.type === "time-changed" ? (
                                <div className="text-xs text-muted-foreground">
                                  was {change.previousEntry?.rideTime}
                                </div>
                              ) : null}
                            </div>
                          </MobileCell>
                          <MobileCell label="Rider">{entry.riderName}</MobileCell>
                          <MobileCell label="Horse">
                            <span className="font-medium">{entry.horseName}</span>
                          </MobileCell>
                          <MobileCell label="Phase">
                            <PhaseChip phase={entry.phase} />
                          </MobileCell>
                          <MobileCell label="Arena">
                            <ArenaChip arena={entry.arena} />
                          </MobileCell>
                          <MobileCell label="Division">{entry.division}</MobileCell>
                          <MobileCell label="Pinny">
                            {entry.pinnyNumber ?? "-"}
                          </MobileCell>
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
    </main>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function MobileCell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
      <div className="flex justify-between gap-3 md:block">
        <span className="text-xs font-medium text-muted-foreground md:hidden">
          {label}
        </span>
        <span className="text-right md:text-left">{children}</span>
      </div>
    </TableCell>
  );
}
