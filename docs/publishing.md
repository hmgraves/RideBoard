# Publishing Shared Schedules

The app can publish a read-only schedule link from `/schedule`.

In local development, published schedules are stored as JSON files in:

```txt
data/published-schedules/
```

For a real hosted deployment, configure Supabase so shared links are durable.

## Supabase Table

Create a table named `published_schedules`:

```sql
create table published_schedules (
  id text primary key,
  title text not null,
  event_id text not null,
  entries jsonb not null,
  team_entries jsonb not null,
  changes jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);
```

## Environment Variables

Set these on the host, such as Vercel:

```txt
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key must stay server-side only. Do not expose it with a
`NEXT_PUBLIC_` prefix.

Use the key labeled `service_role` or `secret service_role`, not the `anon` or
`publishable` key. The publish API inserts rows server-side and needs the
service role key so it can bypass row-level security.

If publishing fails with:

```txt
new row violates row-level security policy
```

then the app is probably using the anon/public key instead of the service role
key.

## Flow

1. Import ShowConnect JSON.
2. Select the trainer team.
3. Open `/schedule`.
4. Click `Publish`.
5. Send the generated `/shared/[shareId]` link to the team.
