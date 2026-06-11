"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { parseEntries } from "../../lib/services/import-parser";
import {
  getScheduleEntries,
  saveScheduleChanges,
  saveScheduleEntries,
} from "../../lib/services/local-storage-service";
import {
  compareScheduleEntries,
  ScheduleChange,
} from "../../lib/services/schedule-change-service";
import {
  getUniqueHorseRiderPairs,
  validatePhaseCounts,
} from "../../lib/services/schedule-service";

import { ArenaChip, PhaseChip } from "@/components/schedule-chips";
import { buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

export default function ImportPage() {
  const [rawJson, setRawJson] = useState("");
  const [eventId, setEventId] = useState("current-event");

  const [importedCount, setImportedCount] = useState(0);
  const [horseCount, setHorseCount] = useState(0);
	const [scheduleChanges, setScheduleChanges] = useState<ScheduleChange[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [validationResults, setValidationResults] = useState<
    ReturnType<typeof validatePhaseCounts>
  >([]);

  const incompleteEntries = useMemo(() => {
    return validationResults.filter((entry) => !entry.isComplete);
  }, [validationResults]);

	function handleImport() {
		setErrorMessage("");

		try {
			const previousEntries = getScheduleEntries();
			const newEntries = parseEntries(rawJson, eventId);

			const changes =
				previousEntries.length > 0
					? compareScheduleEntries(previousEntries, newEntries)
					: [];

			saveScheduleEntries(newEntries);
			saveScheduleChanges(changes);

			setImportedCount(newEntries.length);
			setHorseCount(getUniqueHorseRiderPairs(newEntries).length);
			setValidationResults(validatePhaseCounts(newEntries));
			setScheduleChanges(changes);
		} catch (error) {
			setErrorMessage(
				error instanceof Error ? error.message : "Unable to import schedule."
			);
			setScheduleChanges([]);
		}
	}

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Step 1 of 3
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Import Event Schedule
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Paste the raw ShowConnect entry JSON. The app will extract Dressage,
          Cross Country, and Show Jumping ride times.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Event Data</CardTitle>
            <CardDescription>
              For now, this is a manual JSON paste. Later, this can become a
              ShowConnect URL import.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="eventId"
                className="text-sm font-medium leading-none"
              >
                Event ID
              </label>

              <input
                id="eventId"
                value={eventId}
                onChange={(event) => setEventId(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="rawJson"
                className="text-sm font-medium leading-none"
              >
                Raw JSON
              </label>

              <Textarea
                id="rawJson"
                value={rawJson}
                onChange={(event) => setRawJson(event.target.value)}
                rows={18}
                placeholder="Paste ShowConnect entry JSON here..."
                className="h-[360px] max-h-[360px] resize-none overflow-y-auto font-mono text-xs"
              />
            </div>

            {errorMessage ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleImport} className={buttonVariants()}>
                Import Schedule
              </button>

              {importedCount > 0 ? (
                <Link href="/team" className={buttonVariants({ variant: "outline" })}>
                  Continue to Team Selection
                </Link>
              ) : null}
            </div>
          </CardContent>
        </Card>
				{importedCount > 0 && scheduleChanges.length > 0 ? (
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<CardTitle>Detected Changes</CardTitle>
								<Badge variant="outline">{scheduleChanges.length}</Badge>
							</div>

							<CardDescription>
								These are the ride entries that changed compared with your previous
								import.
							</CardDescription>
						</CardHeader>

						<CardContent>
							<div className="overflow-x-auto rounded-md border">
								<Table>
									<TableHeader className="hidden md:table-header-group">
										<TableRow>
											<TableHead>Change</TableHead>
											<TableHead>Rider</TableHead>
											<TableHead>Horse</TableHead>
											<TableHead>Phase</TableHead>
											<TableHead>Arena</TableHead>
											<TableHead>Previous</TableHead>
											<TableHead>New</TableHead>
										</TableRow>
									</TableHeader>

									<TableBody>
										{scheduleChanges.map((change) => {
											const arena =
												change.newEntry?.arena ?? change.previousEntry?.arena ?? null;

											return (
												<TableRow
													key={change.key}
													className="block border-b p-4 md:table-row md:p-0"
												>
													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex items-center justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																Change
															</span>
															<ChangeBadge type={change.type} />
														</div>
													</TableCell>

													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																Rider
															</span>
															<span className="text-right md:text-left">{change.riderName}</span>
														</div>
													</TableCell>

													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																Horse
															</span>
															<span className="text-right font-medium md:text-left">
																{change.horseName}
															</span>
														</div>
													</TableCell>

													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex items-center justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																Phase
															</span>
															<PhaseChip phase={change.phase} />
														</div>
													</TableCell>

													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex items-center justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																Arena
															</span>
															<ArenaChip arena={arena} />
														</div>
													</TableCell>

													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																Previous
															</span>

															{change.previousEntry ? (
																<div className="text-right md:text-left">
																	<div>{change.previousEntry.rideDateLabel}</div>
																	<div className="text-muted-foreground">
																		{change.previousEntry.rideTime}
																	</div>
																</div>
															) : (
																<span>—</span>
															)}
														</div>
													</TableCell>

													<TableCell className="block px-0 py-1 md:table-cell md:px-4 md:py-3">
														<div className="flex justify-between gap-3 md:block">
															<span className="text-xs font-medium text-muted-foreground md:hidden">
																New
															</span>

															{change.newEntry ? (
																<div className="text-right md:text-left">
																	<div>{change.newEntry.rideDateLabel}</div>
																	<div className="text-muted-foreground">
																		{change.newEntry.rideTime}
																	</div>
																</div>
															) : (
																<span>—</span>
															)}
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
				) : null}

        {importedCount > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Import Summary</CardTitle>
              <CardDescription>
                Here is what was parsed from the imported event data.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Ride entries</p>
                <p className="mt-1 text-2xl font-semibold">{importedCount}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Horse/rider pairs
                </p>
                <p className="mt-1 text-2xl font-semibold">{horseCount}</p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">
                  Incomplete pairs
                </p>
                <p className="mt-1 text-2xl font-semibold">
                  {incompleteEntries.length}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : null}

				{importedCount > 0 && scheduleChanges.length === 0 ? (
					<Card>
						<CardHeader>
							<CardTitle>No Schedule Changes Detected</CardTitle>
							<CardDescription>
								This import matches the previously saved schedule, or this was the first
								import.
							</CardDescription>
						</CardHeader>
					</Card>
				) : null}
				
				{importedCount > 0 && scheduleChanges.length > 0 ? (
					<Card>
						<CardHeader>
							<CardTitle>Schedule Changes</CardTitle>
							<CardDescription>
								Compared with the previously imported schedule.
							</CardDescription>
						</CardHeader>

						<CardContent className="grid gap-4 sm:grid-cols-3">
							<div className="rounded-lg border p-4">
								<p className="text-sm text-muted-foreground">Time changes</p>
								<p className="mt-1 text-2xl font-semibold">
									{
										scheduleChanges.filter((change) => change.type === "time-changed")
											.length
									}
								</p>
							</div>

							<div className="rounded-lg border p-4">
								<p className="text-sm text-muted-foreground">Added rides</p>
								<p className="mt-1 text-2xl font-semibold">
									{scheduleChanges.filter((change) => change.type === "added").length}
								</p>
							</div>

							<div className="rounded-lg border p-4">
								<p className="text-sm text-muted-foreground">Removed rides</p>
								<p className="mt-1 text-2xl font-semibold">
									{
										scheduleChanges.filter((change) => change.type === "removed")
											.length
									}
								</p>
							</div>
						</CardContent>
					</Card>
				) : null}

        {incompleteEntries.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Incomplete Horse/Rider Pairs</CardTitle>
                <Badge variant="destructive">{incompleteEntries.length}</Badge>
              </div>
              <CardDescription>
                These pairs do not have exactly one Dressage, one Cross Country,
                and one Show Jumping entry.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rider</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead className="text-right">Dressage</TableHead>
                      <TableHead className="text-right">XC</TableHead>
                      <TableHead className="text-right">SJ</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {incompleteEntries.map((entry) => (
                      <TableRow key={`${entry.riderName}-${entry.horseName}`}>
                        <TableCell>{entry.riderName}</TableCell>
                        <TableCell>{entry.horseName}</TableCell>
                        <TableCell className="text-right">
                          {entry.dressage}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.crossCountry}
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.showJumping}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </main>
  );
}

function ChangeBadge({ type }: { type: ScheduleChange["type"] }) {
  if (type === "time-changed") {
    return <Badge variant="secondary">Time changed</Badge>;
  }

  if (type === "added") {
    return <Badge variant="outline">Added</Badge>;
  }

  return <Badge variant="destructive">Removed</Badge>;
}
