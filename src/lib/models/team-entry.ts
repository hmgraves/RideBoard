export interface TeamEntry {
  id: string;
  eventId: string;
  teamId: string;

  riderName: string;
  horseName: string;

  entryListId?: number;
  pinnyNumber?: number | null;

  addedAt: string;
}