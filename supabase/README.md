# Adrex database

## Run the migration

1. Open the Supabase project, then **Table Editor**. If tables named `profiles`, `checks`,
   `api_keys`, `visits`, `admin_users`, `demo_usage`, `sponsor_leads`, `audit_log` or
   `app_settings` already exist, stop and ask before running anything.
2. Open **SQL Editor**, click **New query**.
3. Paste the whole of `migrations/20261122120000_adrex_core.sql` and click **Run**.
   It is safe to run again if something interrupts it.
4. Check **Table Editor** now lists the nine tables, each marked with RLS enabled.

## Make yourself the first admin

Sign in to the site once first (so your account exists), then run this in the SQL Editor,
replacing the email with the one you signed in with:

```sql
insert into public.admin_users (user_id, role)
select id, 'owner' from auth.users where email = 'YOUR_EMAIL_HERE'
on conflict (user_id) do update set role = 'owner';
```

## Who can read what

- A signed-in merchant can read only their own profile, API keys (never the key itself) and checks.
- `visits`, `demo_usage`, `sponsor_leads`, `audit_log` and `app_settings` can only be reached by
  the server using the service role key. Keep that key in Vercel as a secret, never in the browser.
- Nothing in the app writes to these tables yet.
