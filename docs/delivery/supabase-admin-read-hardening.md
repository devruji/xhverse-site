# Supabase raw-read admin hardening

[Issue #226](https://github.com/devruji/xhverse-site/issues/226) tracks authenticated access to raw tool data. The migration is prepared and its focused local regression passed. **Production migration has not been applied**; a separate live-permission decision remains pending. This record does not establish production remediation or unauthorized access by a real user.

## Cause and bounded change

Earlier admin hardening covered CV requests, leads and SCD joins but missed two raw-read policies; verification stopped at those previously hardened tables. Both omitted policies allowed any `authenticated` role through `USING (true)`.

[20261012042431_restrict_raw_tool_reads_to_admin.sql](../../supabase/migrations/20261012042431_restrict_raw_tool_reads_to_admin.sql) changes only:

| Table | Policy |
|---|---|
| `data_platform_maturity_submissions` | `authenticated_select_maturity` |
| `scd_design_lab_events` | `scd_design_lab_events_authenticated_read` |

Both predicates become `(select private.is_admin_user())`, using the existing `public.admin_users` allowlist and `auth.uid()`. The maturity policy exists live but is absent from tracked historical migrations, so `DROP POLICY IF EXISTS` followed by `CREATE POLICY ... FOR SELECT` supports both live replacement and clean replay. The events policy is changed with `ALTER POLICY`. Editable user metadata does not confer admin access. Existing inserts, table grants and aggregate benchmark access are preserved.

## Live observation — 2026-10-12

Project `jxfpnfliioqbhzznaphd` had signup enabled, one auth user and one admin. A read-only SQL session probe using hypothetical non-admin JWT claims and `SET ROLE authenticated` returned `private.is_admin_user() = false` but counted:

| Data | Visible rows |
|---|---:|
| Raw maturity submissions | 400, including 2 rows with contact email |
| SCD tracking events | 2,231 |
| CV requests, leads and SCD joins | 0 each |

Only counts were retrieved; no personal-data values were read. No user was created and no signup flow was exercised. The probe demonstrates the database authorization gap, not a complete Auth/API attack reproduction.

## Focused verification

[restrict_raw_tool_reads_to_admin.sql](../../supabase/tests/restrict_raw_tool_reads_to_admin.sql) passed against a disposable cached PostgreSQL 13 instance with synthetic tables and the existing helper contract. It reproduces the permissive baseline and validates both the live-present and clean-absent maturity-policy paths. After applying the migration it denies non-admin/missing-identity/spoofed editable-metadata reads, and preserves admin/service-role reads plus anonymous inserts and benchmark reads. It is a schema subset, not a full production Supabase or browser/auth test.

Manual reproduction from the repository root requires Docker and an already cached `postgres:13` image. It mounts only SQL files read-only, exposes no port and removes the disposable container:

```bash
policy_test_container="xhverse-admin-read-test-$(date +%s)"
docker run --pull=never --rm -d --network none \
  --name "$policy_test_container" --tmpfs /var/lib/postgresql/data \
  -e POSTGRES_HOST_AUTH_METHOD=trust \
  -v "$PWD/supabase:/work/supabase:ro" postgres:13
for attempt in {1..30}; do
  if docker exec "$policy_test_container" pg_isready -U postgres; then break; fi
  sleep 1
done
docker exec "$policy_test_container" pg_isready -U postgres &&
  docker exec "$policy_test_container" psql -U postgres -v ON_ERROR_STOP=1 \
    -f /work/supabase/tests/restrict_raw_tool_reads_to_admin.sql
policy_test_status=$?
docker stop "$policy_test_container"
test "$policy_test_status" -eq 0
```

Reuse matching local evidence through the [validation policy](../agents/validation.md); unchanged application inputs do not require another full-site run. Required application PR CI remains in force. Live application requires explicit approval after the PR and CI are reviewable; the approved read-only investigation does not authorize production mutation. After application, read back both policy predicates and verify non-admin denial, admin reads, anonymous inserts and aggregate access through the deployed Supabase/API paths before reporting production success.

## Separate advisory boundaries

Public posts and aggregate benchmark GraphQL visibility are intentional. Authenticated GraphQL table visibility follows the `SELECT` grants needed by the existing REST admin client; revoking those grants would break its reads. Keep grants and fix row authorization. GraphQL respects PostgreSQL grants and RLS; schema visibility alone does not prove row exposure. See [Supabase GraphQL security](https://supabase.com/docs/guides/graphql/security).

The Management API confirmed the organization was on Free, and leaked-password protection was false. [Supabase password security](https://supabase.com/docs/guides/auth/password-security) requires Pro or above for that feature. No paid upgrade or auth-setting mutation is authorized by this work.

[Issue #227](https://github.com/devruji/xhverse-site/issues/227) has nine unused-index findings: nine non-unique indexes totaling 344,064 bytes across small tables. `stats_reset` was null, so the observation period is unknown. This snapshot does not justify removing indexes; unique indexes and constraints are outside any cleanup scope. No indexes were changed.
