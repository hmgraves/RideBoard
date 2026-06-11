"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { RideScheduleEntry } from "../../lib/models/ride-schedule-entry";
import { TeamEntry } from "../../lib/models/team-entry";
import { saveTeamEntries } from "../../lib/services/local-storage-service";
import { getUniqueHorseRiderPairs } from "../../lib/services/schedule-service";
import { makeHorseRiderKey, normalizeText } from "../../lib/utils/schedule-utils";
import {
  useStoredScheduleEntries,
  useStoredTeamEntries,
} from "../../lib/hooks/use-stored-schedule-data";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function TeamPage() {
  const scheduleEntries = useStoredScheduleEntries();
  const storedTeamEntries = useStoredTeamEntries();

  const allPairs = useMemo(() => {
    return getUniqueHorseRiderPairs(scheduleEntries);
  }, [scheduleEntries]);

  const [search, setSearch] = useState("");
	const [hasSaved, setHasSaved] = useState(false);
  const [draftSelectedKeys, setDraftSelectedKeys] = useState<Set<string> | null>(
    null
  );

  const storedSelectedKeys = useMemo(() => {
    return new Set(
      storedTeamEntries.map((entry) =>
        makeHorseRiderKey(entry.riderName, entry.horseName)
      )
    );
  }, [storedTeamEntries]);

  const selectedKeys = draftSelectedKeys ?? storedSelectedKeys;

  const filteredPairs = useMemo(() => {
    const normalizedSearch = normalizeText(search);

    if (!normalizedSearch) {
      return allPairs;
    }

    return allPairs.filter((pair) => {
      const searchableText = normalizeText(
        [
          pair.riderName,
          pair.horseName,
          pair.division,
          pair.divisionShortName,
          pair.stableWith,
          pair.stallAssignment,
          pair.pinnyNumber,
        ]
          .filter(Boolean)
          .join(" ")
      );

      return searchableText.includes(normalizedSearch);
    });
  }, [allPairs, search]);

  function isSelected(pair: RideScheduleEntry) {
    return selectedKeys.has(makeHorseRiderKey(pair.riderName, pair.horseName));
  }

	function togglePair(pair: RideScheduleEntry) {
		const key = makeHorseRiderKey(pair.riderName, pair.horseName);

		setHasSaved(false);

		setDraftSelectedKeys((current) => {
			const next = new Set(current ?? selectedKeys);

			if (next.has(key)) {
				next.delete(key);
			} else {
				next.add(key);
			}

			return next;
		});
	}

	function selectFilteredPairs() {
		setHasSaved(false);

		setDraftSelectedKeys((current) => {
			const next = new Set(current ?? selectedKeys);

			for (const pair of filteredPairs) {
				next.add(makeHorseRiderKey(pair.riderName, pair.horseName));
			}

			return next;
		});
	}

	function clearFilteredPairs() {
		setHasSaved(false);

		setDraftSelectedKeys((current) => {
			const next = new Set(current ?? selectedKeys);

			for (const pair of filteredPairs) {
				next.delete(makeHorseRiderKey(pair.riderName, pair.horseName));
			}

			return next;
		});
	}

	function saveTeam() {
		const teamEntries: TeamEntry[] = allPairs
			.filter((pair) => isSelected(pair))
			.map((pair) => ({
				id: makeHorseRiderKey(pair.riderName, pair.horseName),
				eventId: pair.eventId,
				teamId: "my-team",
				riderName: pair.riderName,
				horseName: pair.horseName,
				entryListId: pair.entryListId,
				pinnyNumber: pair.pinnyNumber,
				addedAt: new Date().toISOString(),
			}));

		saveTeamEntries(teamEntries);
		setHasSaved(true);
	}

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-muted-foreground">
          Step 2 of 3
        </p>

        <h1 className="text-3xl font-bold tracking-tight">
          Select Your Team
        </h1>

        <p className="max-w-2xl text-muted-foreground">
          Choose the horse/rider pairs you want included in your trainer
          schedule. You can search by rider, horse, division, stableWith,
          stall, or pinny number.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <CardTitle>Horse/Rider Pairs</CardTitle>
                <CardDescription>
                  Imported {allPairs.length} horse/rider pairs.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {selectedKeys.size} selected
                </Badge>

                <Link
                  href="/import"
                  className={buttonVariants({ variant: "outline" })}
                >
                  Back to Import
                </Link>

                <button
                  type="button"
                  onClick={saveTeam}
                  className={buttonVariants()}
                >
                  Save Team
                </button>

                {selectedKeys.size > 0 ? (
                  <Link
                    href="/schedule"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    View Schedule
                  </Link>
                ) : null}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rider, horse, division, stableWith, stall, pinny..."
                className="md:max-w-md"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={selectFilteredPairs}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Select Filtered
                </button>

                <button
                  type="button"
                  onClick={clearFilteredPairs}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Clear Filtered
                </button>
              </div>
            </div>
						{hasSaved ? (
							<div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
								Team saved. You can now view the schedule.
							</div>
						) : null}
            <div className="rounded-md border">
              <div className="max-h-[650px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 z-10 bg-background">
                    <TableRow>
                      <TableHead className="w-[60px]">Select</TableHead>
                      <TableHead>Rider</TableHead>
                      <TableHead>Horse</TableHead>
                      <TableHead>Division</TableHead>
                      <TableHead>Pinny</TableHead>
                      <TableHead>Stable With</TableHead>
                      <TableHead>Stall</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredPairs.map((pair) => (
                      <TableRow
                        key={makeHorseRiderKey(pair.riderName, pair.horseName)}
                        className="cursor-pointer"
                        onClick={() => togglePair(pair)}
                      >
                        <TableCell onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            checked={isSelected(pair)}
                            onCheckedChange={() => togglePair(pair)}
                          />
                        </TableCell>

                        <TableCell className="font-medium">
                          {pair.riderName}
                        </TableCell>

                        <TableCell>{pair.horseName}</TableCell>
                        <TableCell>{pair.division}</TableCell>
                        <TableCell>{pair.pinnyNumber ?? "—"}</TableCell>
                        <TableCell>{pair.stableWith ?? "—"}</TableCell>
                        <TableCell>{pair.stallAssignment ?? "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {filteredPairs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No horse/rider pairs match your search.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
