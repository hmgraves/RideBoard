import { createPublishedSchedule } from "../../../lib/services/published-schedule-service";
import { PublishedScheduleInput } from "../../../lib/models/published-schedule";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as PublishedScheduleInput;

    if (!input.entries?.length || !input.teamEntries?.length) {
      return Response.json(
        { error: "A schedule and selected team are required before publishing." },
        { status: 400 }
      );
    }

    const schedule = await createPublishedSchedule(input);
    return Response.json(schedule);
  } catch (error) {
    console.error("Unable to publish schedule", error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to publish schedule.",
      },
      { status: 500 }
    );
  }
}
