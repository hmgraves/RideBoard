import {
  getPublishedSchedule,
  updatePublishedSchedule,
} from "../../../../lib/services/published-schedule-service";
import { PublishedScheduleInput } from "../../../../lib/models/published-schedule";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  const { shareId } = await params;
  const schedule = await getPublishedSchedule(shareId);

  if (!schedule) {
    return Response.json({ error: "Published schedule not found." }, { status: 404 });
  }

  return Response.json(schedule);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;
    const body = (await request.json()) as PublishedScheduleInput & {
      editToken?: string;
    };

    if (!body.editToken) {
      return Response.json(
        { error: "An edit token is required to update this schedule." },
        { status: 403 }
      );
    }

    if (!body.entries?.length || !body.teamEntries?.length) {
      return Response.json(
        { error: "A schedule and selected team are required before updating." },
        { status: 400 }
      );
    }

    const schedule = await updatePublishedSchedule(
      shareId,
      body.editToken,
      body
    );

    return Response.json(schedule);
  } catch (error) {
    console.error("Unable to update published schedule", error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update schedule.",
      },
      { status: 500 }
    );
  }
}
