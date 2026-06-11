import { getPublishedSchedule } from "../../../../lib/services/published-schedule-service";

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
