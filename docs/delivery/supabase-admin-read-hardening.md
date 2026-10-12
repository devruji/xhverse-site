# Supabase raw-read admin hardening

[Issue #226](https://github.com/devruji/xhverse-site/issues/226) tracks authenticated access to raw tool data. The user explicitly approved the two-policy production migration after reviewable [PR #333](https://github.com/devruji/xhverse-site/pull/333) and initial CI. `apply_migration` succeeded on 2026-10-12; live policy/readback checks confirm the HIGH authorization defect is remediated. Issue #226 remains open for residual warning acceptance and the plan decision. No unauthorized access by a real user was demonstrated.

## Cause and bounded change

Earlier admin hardening covered CV requests, leads and SCD joins but missed two raw-read policies; verification stopped at those previously hardened tables. Both omitted policies allowed any `authenticated` role through `USING (true)`.

[20261012043426_restrict_raw_tool_reads_to_admin.sql](../../supabase/migrations/20261012043426_restrict_raw_tool_reads_to_admin.sql) changes only:

| Table | Policy |
|---|---|
| `data_platform_maturity_submissions` | `authenticated_select_maturity` |
| `scd_design_lab_events` | `scd_design_lab_events_authenticated_read` |

Both predicates are `(select private.is_admin_user())`, using the existing `public.admin_users` allowlist and `auth.uid()`. The maturity policy existed live but was absent from tracked historical migrations, so `DROP POLICY IF EXISTS` followed by `CREATE POLICY ... FOR SELECT` supports both live replacement and clean replay. The events policy is changed with `ALTER POLICY`. Editable user metadata does not confer admin access. Existing inserts, table grants and aggregate benchmark access are preserved.

## Before application — 2026-10-12

Project `jxfpnfliioqbhzznaphd` had signup enabled, one auth user and one admin. A read-only SQL session probe using hypothetical non-admin JWT claims and `SET ROLE authenticated` returned `private.is_admin_user() = false` but counted:

| Data | Visible rows |
|---|---:|
| Raw maturity submissions | 400, including 2 rows with contact email |
| SCD tracking events | 2,231 |
| CV requests, leads and SCD joins | 0 each |

Only counts were retrieved; no personal-data values were read. No user was created and no signup flow was exercised. The probe demonstrates the database authorization gap, not a complete Auth/API attack reproduction.

## Production verification — 2026-10-12

The remote Supabase migration ledger records version `20261012043426`, name `restrict_raw_tool_reads_to_admin`. The local filename matches that ledger; reviewed SQL content was unchanged by the version alignment. Live `pg_policies` shows both target policies as authenticated `SELECT` with the admin helper; anonymous `INSERT` predicates and grants remain unchanged.

Read-only role/JWT-claim probes returned:

| Identity | Admin helper | Raw maturity | Events | SCD progress |
|---|---|---:|---:|---:|
| Hypothetical non-admin, editable admin metadata spoofed | false | 0 | 0 | 0 |
| Configured admin | true | 400 | 2,231 | 181 |

The non-admin also saw zero CV/lead/join rows and one aggregate benchmark row. The configured admin identity was selected internally in the database without returning its UID. Anonymous probes saw 14 published posts, zero unpublished posts and one benchmark row; target-table `INSERT` privileges were true and raw `SELECT` privileges false.

No production rows were inserted, updated or deleted. Live anonymous inserts were not exercised; preservation is supported by policy/grant readback and the local fixture. No browser password login or full Supabase Auth/API session was tested.

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

Reuse matching local evidence through the [validation policy](../agents/validation.md); unchanged application inputs do not require another full-site run. [Initial PR #333 CI](https://github.com/devruji/xhverse-site/actions/runs/38204058841) passed in 96s: 585 unit tests, 100% across all coverage metrics, 69 delivery fixtures, 84 E2E checks and one build. The SQL fixture was a separate focused check. Fresh CI will validate the final PR after migration-ledger alignment; its result is pending.

## Separate advisory boundaries

Post-application advisors still report two anonymous and nine authenticated GraphQL visibility WARN findings plus the leaked-password-protection WARN. Public posts and aggregate benchmark GraphQL visibility are intentional. Authenticated GraphQL table visibility follows the `SELECT` grants needed by the existing REST admin client; revoking those grants would break its reads. Keep the grants; the two raw-data row predicates are now hardened. GraphQL respects PostgreSQL grants and RLS; schema visibility alone does not prove row exposure. See [Supabase GraphQL security](https://supabase.com/docs/guides/graphql/security).

The Management API confirmed the organization was on Free, and leaked-password protection was false. [Supabase password security](https://supabase.com/docs/guides/auth/password-security) requires Pro or above for that feature. No paid upgrade or auth-setting mutation was authorized or performed. The remaining plan/acceptance decision is separate from the completed two-policy migration.

[Issue #227](https://github.com/devruji/xhverse-site/issues/227) has nine unused-index findings: nine non-unique indexes totaling 344,064 bytes across small tables. `stats_reset` was null, so the observation period is unknown. This snapshot does not justify removing indexes; unique indexes and constraints are outside any cleanup scope. No indexes were changed.
