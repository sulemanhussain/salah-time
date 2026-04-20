# Salah Time — Database Schema Diagram

```mermaid
erDiagram

    %% ─────────────────────────────────────────
    %%  CORE ENTITIES
    %% ─────────────────────────────────────────

    users {
        uuid        id              PK
        text        email           UK
        text        password_hash
        boolean     is_active
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    user_profiles {
        uuid        user_id         PK  FK
        text        full_name
        text        phone
        text        city
        gender_type gender
        text        bio
        text        avatar_url
        boolean     is_volunteer
        timestamptz volunteer_since
        timestamptz updated_at
    }

    mosques {
        uuid        id              PK
        text        google_place_id UK
        text        name
        text        vicinity
        numeric     lat
        numeric     lng
        text[]      place_types
        numeric     rating
        int         user_ratings_total
        timestamptz last_fetched_at
        timestamptz created_at
        timestamptz updated_at
    }

    %% ─────────────────────────────────────────
    %%  PRAYER TIMINGS  (cached + community)
    %% ─────────────────────────────────────────

    prayer_timings {
        uuid        id              PK
        uuid        mosque_id       FK
        date        date
        smallint    method
        time        fajr
        time        sunrise
        time        dhuhr
        time        asr
        time        sunset
        time        maghrib
        time        isha
        time        imsak
        time        midnight
        smallint    hijri_day
        smallint    hijri_month_num
        text        hijri_month_en
        text        hijri_month_ar
        int         hijri_year
        timestamptz fetched_at
        timestamptz expires_at
    }

    congregation_timings {
        uuid        id                  PK
        uuid        mosque_id           FK
        uuid        submitted_by        FK
        time        fajr_congregation
        time        dhuhr_congregation
        time        asr_congregation
        time        maghrib_congregation
        time        isha_congregation
        boolean     is_verified
        uuid        verified_by         FK
        timestamptz verified_at
        date        effective_from
        date        effective_to
        timestamptz created_at
    }

    %% ─────────────────────────────────────────
    %%  COMMUNITY ACTIONS
    %% ─────────────────────────────────────────

    timing_updates {
        uuid            id              PK
        uuid            mosque_id       FK
        uuid            submitted_by    FK
        prayer_name     prayer
        time            adhan_time
        time            congregation_time
        update_status   status
        text            reviewer_notes
        uuid            reviewed_by     FK
        timestamptz     reviewed_at
        timestamptz     created_at
        timestamptz     updated_at
    }

    timing_reports {
        uuid            id              PK
        uuid            mosque_id       FK
        uuid            reported_by     FK
        report_reason   reason
        text            details
        report_status   status
        uuid            resolved_by     FK
        timestamptz     resolved_at
        timestamptz     created_at
        timestamptz     updated_at
    }

    %% ─────────────────────────────────────────
    %%  NOTIFICATIONS
    %% ─────────────────────────────────────────

    notifications {
        uuid                id                  PK
        uuid                user_id             FK
        notification_type   type
        text                title
        text                body
        uuid                related_mosque_id   FK
        uuid                related_update_id   FK
        uuid                related_report_id   FK
        boolean             is_read
        timestamptz         created_at
    }

    %% ─────────────────────────────────────────
    %%  RELATIONSHIPS
    %% ─────────────────────────────────────────

    %% One user → one profile (1:1)
    users                   ||--||   user_profiles        : "has profile"

    %% One mosque → many cached timings (one per day)
    mosques                 ||--o{   prayer_timings        : "has cached timings"

    %% One mosque → many congregation timing versions (history)
    mosques                 ||--o{   congregation_timings  : "has congregation timings"

    %% One user submits many congregation timings
    users                   ||--o{   congregation_timings  : "submits"

    %% One user verifies congregation timings
    users                   ||--o{   congregation_timings  : "verifies"

    %% One mosque → many timing update submissions
    mosques                 ||--o{   timing_updates        : "receives updates"

    %% One user submits many timing updates
    users                   ||--o{   timing_updates        : "submits"

    %% One user reviews timing updates
    users                   ||--o{   timing_updates        : "reviews"

    %% One mosque → many reports
    mosques                 ||--o{   timing_reports        : "receives reports"

    %% One user files many reports
    users                   ||--o{   timing_reports        : "files"

    %% One user resolves reports
    users                   ||--o{   timing_reports        : "resolves"

    %% One user → many notifications
    users                   ||--o{   notifications         : "receives"

    %% Notifications optionally link back to source records
    mosques                 ||--o{   notifications         : "triggers"
    timing_updates          ||--o{   notifications         : "triggers"
    timing_reports          ||--o{   notifications         : "triggers"
```

---

## Relationship summary

| Relationship | Cardinality | Note |
|---|---|---|
| `users` → `user_profiles` | 1 : 1 | Created on first profile save |
| `mosques` → `prayer_timings` | 1 : many | One row per day per calculation method; auto-expires |
| `mosques` → `congregation_timings` | 1 : many | Full history kept; `effective_to IS NULL` = current active row |
| `users` → `congregation_timings` | 1 : many | As submitter **and** as verifier (two separate FK columns) |
| `mosques` → `timing_updates` | 1 : many | Each update targets one prayer of one mosque |
| `users` → `timing_updates` | 1 : many | As submitter **and** as reviewer |
| `mosques` → `timing_reports` | 1 : many | Multiple users can report the same mosque |
| `users` → `timing_reports` | 1 : many | As reporter **and** as resolver |
| `users` → `notifications` | 1 : many | Notifications fan out per user |
| `notifications` → `mosques / updates / reports` | many : 0-1 | Optional back-links to source record |
