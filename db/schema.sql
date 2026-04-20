-- =============================================================
--  Salah Time — PostgreSQL Database Schema
--  Tables → Indexes → Views → Stored Procedures
-- =============================================================

-- Enable useful extensions
-- pg_uuidv7 : UUID v7 (time-sortable) primary keys — sequential inserts, no index fragmentation.
--   PostgreSQL 17+ : use the native uuidv7() function instead and drop this extension.
--   Install via: https://github.com/fboulnois/pg_uuidv7
CREATE EXTENSION IF NOT EXISTS "pg_uuidv7";  -- uuid_generate_v7()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram search on mosque names

-- Compatibility shim: on PG 17+ replace uuid_generate_v7() with the native uuidv7().
-- On PG 13-16 with pg_uuidv7 installed this wrapper keeps the rest of the schema identical.
CREATE OR REPLACE FUNCTION uuid_generate_v7()
RETURNS UUID LANGUAGE sql AS $$
    SELECT uuid_generate_v7();
$$;

-- =============================================================
--  ENUMS
-- =============================================================

CREATE TYPE gender_type AS ENUM ('male', 'female', 'prefer_not_to_say');

CREATE TYPE report_reason AS ENUM (
    'incorrect_adhan',
    'incorrect_congregation',
    'missing_timing',
    'outdated_schedule',
    'details_mismatch',
    'other'
);

CREATE TYPE update_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE report_status AS ENUM ('open', 'in_review', 'resolved', 'dismissed');

CREATE TYPE notification_type AS ENUM ('update', 'report', 'verified', 'nearby', 'system');

CREATE TYPE prayer_name AS ENUM ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha');

-- =============================================================
--  TABLES
-- =============================================================

-- -------------------------------------------------------------
--  users
-- -------------------------------------------------------------
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v7(),
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
--  user_profiles
-- -------------------------------------------------------------
CREATE TABLE user_profiles (
    user_id         UUID        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name       TEXT,
    phone           TEXT,
    city            TEXT,
    gender          gender_type,
    bio             TEXT        CHECK (char_length(bio) <= 300),
    avatar_url      TEXT,
    is_volunteer    BOOLEAN     NOT NULL DEFAULT FALSE,
    volunteer_since TIMESTAMPTZ,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
--  mosques  (cached from Google Places API)
-- -------------------------------------------------------------
CREATE TABLE mosques (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v7(),
    google_place_id     TEXT        NOT NULL UNIQUE,
    name                TEXT        NOT NULL,
    vicinity            TEXT,
    lat                 NUMERIC(10, 7) NOT NULL,
    lng                 NUMERIC(10, 7) NOT NULL,
    place_types         TEXT[],
    rating              NUMERIC(3, 1),
    user_ratings_total  INT,
    last_fetched_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
--  prayer_timings  (cached from Aladhan API — one row per mosque per day)
-- -------------------------------------------------------------
CREATE TABLE prayer_timings (
    id              UUID    PRIMARY KEY DEFAULT uuid_generate_v7(),
    mosque_id       UUID    NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    date            DATE    NOT NULL,
    method          SMALLINT NOT NULL DEFAULT 2,    -- Aladhan calculation method
    fajr            TIME    NOT NULL,
    sunrise         TIME    NOT NULL,
    dhuhr           TIME    NOT NULL,
    asr             TIME    NOT NULL,
    sunset          TIME    NOT NULL,
    maghrib         TIME    NOT NULL,
    isha            TIME    NOT NULL,
    imsak           TIME    NOT NULL,
    midnight        TIME    NOT NULL,
    -- Hijri date
    hijri_day       SMALLINT NOT NULL,
    hijri_month_num SMALLINT NOT NULL,
    hijri_month_en  TEXT     NOT NULL,
    hijri_month_ar  TEXT     NOT NULL,
    hijri_year      INT      NOT NULL,
    --
    fetched_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours',

    CONSTRAINT uq_prayer_timings_mosque_date_method UNIQUE (mosque_id, date, method)
);

-- -------------------------------------------------------------
--  congregation_timings
--  Community-verified congregation start times per mosque.
--  Only one active row per mosque at a time (effective_to IS NULL).
-- -------------------------------------------------------------
CREATE TABLE congregation_timings (
    id                      UUID    PRIMARY KEY DEFAULT uuid_generate_v7(),
    mosque_id               UUID    NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    submitted_by            UUID    NOT NULL REFERENCES users(id),
    fajr_congregation       TIME    NOT NULL,
    dhuhr_congregation      TIME    NOT NULL,
    asr_congregation        TIME    NOT NULL,
    maghrib_congregation    TIME    NOT NULL,
    isha_congregation       TIME    NOT NULL,
    is_verified             BOOLEAN NOT NULL DEFAULT FALSE,
    verified_by             UUID    REFERENCES users(id),
    verified_at             TIMESTAMPTZ,
    effective_from          DATE    NOT NULL DEFAULT CURRENT_DATE,
    effective_to            DATE,           -- NULL = currently active
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_effective_range CHECK (effective_to IS NULL OR effective_to >= effective_from)
);

-- -------------------------------------------------------------
--  timing_updates  (volunteer submissions — one prayer at a time)
-- -------------------------------------------------------------
CREATE TABLE timing_updates (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v7(),
    mosque_id       UUID            NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    submitted_by    UUID            NOT NULL REFERENCES users(id),
    prayer          prayer_name     NOT NULL,
    adhan_time      TIME            NOT NULL,
    congregation_time TIME          NOT NULL,
    status          update_status   NOT NULL DEFAULT 'pending',
    reviewer_notes  TEXT,
    reviewed_by     UUID            REFERENCES users(id),
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
--  timing_reports
-- -------------------------------------------------------------
CREATE TABLE timing_reports (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v7(),
    mosque_id       UUID            NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    reported_by     UUID            NOT NULL REFERENCES users(id),
    reason          report_reason   NOT NULL,
    details         TEXT            NOT NULL CHECK (char_length(details) >= 15 AND char_length(details) <= 500),
    status          report_status   NOT NULL DEFAULT 'open',
    resolved_by     UUID            REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- -------------------------------------------------------------
--  notifications
-- -------------------------------------------------------------
CREATE TABLE notifications (
    id                  UUID                PRIMARY KEY DEFAULT uuid_generate_v7(),
    user_id             UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                notification_type   NOT NULL,
    title               TEXT                NOT NULL,
    body                TEXT                NOT NULL,
    related_mosque_id   UUID                REFERENCES mosques(id) ON DELETE SET NULL,
    related_update_id   UUID                REFERENCES timing_updates(id) ON DELETE SET NULL,
    related_report_id   UUID                REFERENCES timing_reports(id) ON DELETE SET NULL,
    is_read             BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- =============================================================
--  INDEXES
-- =============================================================

-- users
CREATE INDEX idx_users_email ON users (email);

-- mosques
CREATE INDEX idx_mosques_google_place_id ON mosques (google_place_id);
CREATE INDEX idx_mosques_location       ON mosques USING gist (point(lng, lat));  -- spatial queries
CREATE INDEX idx_mosques_name_trgm      ON mosques USING gin (name gin_trgm_ops); -- fuzzy name search

-- prayer_timings
CREATE INDEX idx_prayer_timings_mosque_date ON prayer_timings (mosque_id, date DESC);
CREATE INDEX idx_prayer_timings_expires_at  ON prayer_timings (expires_at)
    WHERE expires_at < NOW();  -- partial index for cache cleanup

-- congregation_timings
CREATE INDEX idx_congregation_active ON congregation_timings (mosque_id)
    WHERE effective_to IS NULL;  -- fast lookup of current timings

-- timing_updates
CREATE INDEX idx_timing_updates_mosque    ON timing_updates (mosque_id, created_at DESC);
CREATE INDEX idx_timing_updates_user      ON timing_updates (submitted_by, created_at DESC);
CREATE INDEX idx_timing_updates_pending   ON timing_updates (status, created_at)
    WHERE status = 'pending';

-- timing_reports
CREATE INDEX idx_timing_reports_mosque   ON timing_reports (mosque_id, created_at DESC);
CREATE INDEX idx_timing_reports_user     ON timing_reports (reported_by, created_at DESC);
CREATE INDEX idx_timing_reports_open     ON timing_reports (status, created_at)
    WHERE status IN ('open', 'in_review');

-- notifications
CREATE INDEX idx_notifications_user_unread ON notifications (user_id, created_at DESC)
    WHERE is_read = FALSE;
CREATE INDEX idx_notifications_user_all    ON notifications (user_id, created_at DESC);

-- =============================================================
--  TRIGGERS  (auto-update updated_at)
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_timing_updates_updated_at
    BEFORE UPDATE ON timing_updates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_timing_reports_updated_at
    BEFORE UPDATE ON timing_reports
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_mosques_updated_at
    BEFORE UPDATE ON mosques
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
--  VIEWS
-- =============================================================

-- -------------------------------------------------------------
--  v_mosque_current_timings
--  Today's calculated prayer times + latest verified congregation
--  times for every mosque. Ready to serve directly to the client.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_mosque_current_timings AS
SELECT
    m.id                        AS mosque_id,
    m.google_place_id,
    m.name,
    m.vicinity,
    m.lat,
    m.lng,
    -- Calculated prayer times
    pt.fajr,
    pt.sunrise,
    pt.dhuhr,
    pt.asr,
    pt.sunset,
    pt.maghrib,
    pt.isha,
    -- Hijri date
    pt.hijri_day,
    pt.hijri_month_en,
    pt.hijri_year,
    -- Community congregation times (NULL when none submitted yet)
    ct.fajr_congregation,
    ct.dhuhr_congregation,
    ct.asr_congregation,
    ct.maghrib_congregation,
    ct.isha_congregation,
    ct.is_verified              AS timings_verified,
    ct.verified_at
FROM mosques m
LEFT JOIN prayer_timings pt
    ON pt.mosque_id = m.id
    AND pt.date = CURRENT_DATE
    AND pt.expires_at > NOW()
LEFT JOIN congregation_timings ct
    ON ct.mosque_id = m.id
    AND ct.effective_to IS NULL
    AND ct.is_verified = TRUE;

-- -------------------------------------------------------------
--  v_user_contribution_stats
--  Per-user stats used on the Home dashboard.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_contribution_stats AS
SELECT
    u.id                                            AS user_id,
    u.email,
    up.is_volunteer,
    COUNT(DISTINCT tu.id)                           AS timings_updated,
    COUNT(DISTINCT tr.id)                           AS reports_submitted,
    COUNT(DISTINCT tr.id) FILTER (
        WHERE tr.status = 'resolved'
    )                                               AS reports_resolved,
    COUNT(DISTINCT ct.id) FILTER (
        WHERE ct.is_verified = TRUE
    )                                               AS mosques_verified,
    -- Activity in the last 7 days
    COUNT(DISTINCT tu.id) FILTER (
        WHERE tu.created_at >= NOW() - INTERVAL '7 days'
    )                                               AS updates_this_week,
    MAX(GREATEST(tu.created_at, tr.created_at))    AS last_active_at
FROM users u
LEFT JOIN user_profiles up      ON up.user_id = u.id
LEFT JOIN timing_updates tu     ON tu.submitted_by = u.id
LEFT JOIN timing_reports tr     ON tr.reported_by = u.id
LEFT JOIN congregation_timings ct ON ct.submitted_by = u.id
GROUP BY u.id, u.email, up.is_volunteer;

-- -------------------------------------------------------------
--  v_mosque_report_summary
--  Open report count per mosque — useful for moderation queue.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_mosque_report_summary AS
SELECT
    m.id            AS mosque_id,
    m.name,
    m.vicinity,
    COUNT(*)        FILTER (WHERE tr.status = 'open')        AS open_reports,
    COUNT(*)        FILTER (WHERE tr.status = 'in_review')   AS in_review_reports,
    MAX(tr.created_at)                                        AS latest_report_at
FROM mosques m
LEFT JOIN timing_reports tr ON tr.mosque_id = m.id
GROUP BY m.id, m.name, m.vicinity
HAVING COUNT(*) FILTER (WHERE tr.status IN ('open', 'in_review')) > 0;

-- -------------------------------------------------------------
--  v_user_notifications
--  Notifications with mosque name denormalised for easy display.
-- -------------------------------------------------------------
CREATE OR REPLACE VIEW v_user_notifications AS
SELECT
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.body,
    n.is_read,
    n.created_at,
    m.name          AS mosque_name,
    m.google_place_id
FROM notifications n
LEFT JOIN mosques m ON m.id = n.related_mosque_id
ORDER BY n.created_at DESC;

-- =============================================================
--  STORED PROCEDURES & FUNCTIONS
-- =============================================================

-- -------------------------------------------------------------
--  fn_upsert_mosque
--  Insert or refresh a mosque from Google Places API response.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_upsert_mosque(
    p_google_place_id       TEXT,
    p_name                  TEXT,
    p_vicinity              TEXT,
    p_lat                   NUMERIC,
    p_lng                   NUMERIC,
    p_place_types           TEXT[],
    p_rating                NUMERIC DEFAULT NULL,
    p_user_ratings_total    INT     DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_mosque_id UUID;
BEGIN
    INSERT INTO mosques (
        google_place_id, name, vicinity, lat, lng,
        place_types, rating, user_ratings_total, last_fetched_at
    )
    VALUES (
        p_google_place_id, p_name, p_vicinity, p_lat, p_lng,
        p_place_types, p_rating, p_user_ratings_total, NOW()
    )
    ON CONFLICT (google_place_id) DO UPDATE SET
        name                = EXCLUDED.name,
        vicinity            = EXCLUDED.vicinity,
        lat                 = EXCLUDED.lat,
        lng                 = EXCLUDED.lng,
        place_types         = EXCLUDED.place_types,
        rating              = EXCLUDED.rating,
        user_ratings_total  = EXCLUDED.user_ratings_total,
        last_fetched_at     = NOW(),
        updated_at          = NOW()
    RETURNING id INTO v_mosque_id;

    RETURN v_mosque_id;
END;
$$;

-- -------------------------------------------------------------
--  fn_upsert_prayer_timings
--  Cache Aladhan API response for a mosque + date.
--  Returns existing row if still valid, inserts/updates otherwise.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_upsert_prayer_timings(
    p_mosque_id     UUID,
    p_date          DATE,
    p_method        SMALLINT,
    p_fajr          TIME,   p_sunrise   TIME,
    p_dhuhr         TIME,   p_asr       TIME,
    p_sunset        TIME,   p_maghrib   TIME,
    p_isha          TIME,   p_imsak     TIME,
    p_midnight      TIME,
    p_hijri_day     SMALLINT, p_hijri_month_num SMALLINT,
    p_hijri_month_en TEXT,  p_hijri_month_ar TEXT,
    p_hijri_year    INT
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO prayer_timings (
        mosque_id, date, method,
        fajr, sunrise, dhuhr, asr, sunset, maghrib, isha, imsak, midnight,
        hijri_day, hijri_month_num, hijri_month_en, hijri_month_ar, hijri_year,
        expires_at
    )
    VALUES (
        p_mosque_id, p_date, p_method,
        p_fajr, p_sunrise, p_dhuhr, p_asr, p_sunset, p_maghrib, p_isha, p_imsak, p_midnight,
        p_hijri_day, p_hijri_month_num, p_hijri_month_en, p_hijri_month_ar, p_hijri_year,
        (p_date + INTERVAL '1 day')::TIMESTAMPTZ  -- expires at midnight of the next day
    )
    ON CONFLICT (mosque_id, date, method) DO UPDATE SET
        fajr            = EXCLUDED.fajr,
        sunrise         = EXCLUDED.sunrise,
        dhuhr           = EXCLUDED.dhuhr,
        asr             = EXCLUDED.asr,
        sunset          = EXCLUDED.sunset,
        maghrib         = EXCLUDED.maghrib,
        isha            = EXCLUDED.isha,
        imsak           = EXCLUDED.imsak,
        midnight        = EXCLUDED.midnight,
        hijri_day       = EXCLUDED.hijri_day,
        hijri_month_num = EXCLUDED.hijri_month_num,
        hijri_month_en  = EXCLUDED.hijri_month_en,
        hijri_month_ar  = EXCLUDED.hijri_month_ar,
        hijri_year      = EXCLUDED.hijri_year,
        fetched_at      = NOW(),
        expires_at      = EXCLUDED.expires_at
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$;

-- -------------------------------------------------------------
--  fn_submit_timing_update
--  Volunteer submits updated adhan + congregation for one prayer.
--  Raises exception if user is not a volunteer.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_submit_timing_update(
    p_user_id           UUID,
    p_mosque_id         UUID,
    p_prayer            prayer_name,
    p_adhan_time        TIME,
    p_congregation_time TIME
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_update_id UUID;
BEGIN
    -- Guard: only volunteers may submit
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = p_user_id AND is_volunteer = TRUE
    ) THEN
        RAISE EXCEPTION 'User % is not a registered volunteer', p_user_id
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    INSERT INTO timing_updates (mosque_id, submitted_by, prayer, adhan_time, congregation_time)
    VALUES (p_mosque_id, p_user_id, p_prayer, p_adhan_time, p_congregation_time)
    RETURNING id INTO v_update_id;

    -- Notify mosque followers / admins
    INSERT INTO notifications (user_id, type, title, body, related_mosque_id, related_update_id)
    SELECT
        u.id,
        'update',
        'Timing Update Submitted',
        'A volunteer has submitted updated ' || p_prayer || ' timings for review.',
        p_mosque_id,
        v_update_id
    FROM users u
    JOIN user_profiles up ON up.user_id = u.id
    WHERE up.is_volunteer = TRUE AND u.id <> p_user_id
    LIMIT 10;  -- notify moderators, not all users

    RETURN v_update_id;
END;
$$;

-- -------------------------------------------------------------
--  fn_review_timing_update
--  Approve or reject a pending timing update.
--  On approval, writes into congregation_timings.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_review_timing_update(
    p_update_id     UUID,
    p_reviewer_id   UUID,
    p_approved      BOOLEAN,
    p_notes         TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_update    timing_updates%ROWTYPE;
    v_new_status update_status;
BEGIN
    SELECT * INTO v_update FROM timing_updates WHERE id = p_update_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Timing update % not found', p_update_id;
    END IF;
    IF v_update.status <> 'pending' THEN
        RAISE EXCEPTION 'Update % has already been reviewed (status: %)', p_update_id, v_update.status;
    END IF;

    v_new_status := CASE WHEN p_approved THEN 'approved'::update_status ELSE 'rejected'::update_status END;

    UPDATE timing_updates SET
        status          = v_new_status,
        reviewed_by     = p_reviewer_id,
        reviewed_at     = NOW(),
        reviewer_notes  = p_notes
    WHERE id = p_update_id;

    IF p_approved THEN
        -- Expire the current active congregation timing for this mosque
        UPDATE congregation_timings SET
            effective_to = CURRENT_DATE
        WHERE mosque_id = v_update.mosque_id
          AND effective_to IS NULL;

        -- Insert the newly approved timing
        INSERT INTO congregation_timings (
            mosque_id, submitted_by,
            fajr_congregation, dhuhr_congregation, asr_congregation,
            maghrib_congregation, isha_congregation,
            is_verified, verified_by, verified_at
        )
        SELECT
            v_update.mosque_id,
            v_update.submitted_by,
            -- Carry forward existing times for unaffected prayers
            COALESCE(CASE WHEN v_update.prayer = 'fajr'    THEN v_update.congregation_time END, prev.fajr_congregation),
            COALESCE(CASE WHEN v_update.prayer = 'dhuhr'   THEN v_update.congregation_time END, prev.dhuhr_congregation),
            COALESCE(CASE WHEN v_update.prayer = 'asr'     THEN v_update.congregation_time END, prev.asr_congregation),
            COALESCE(CASE WHEN v_update.prayer = 'maghrib' THEN v_update.congregation_time END, prev.maghrib_congregation),
            COALESCE(CASE WHEN v_update.prayer = 'isha'    THEN v_update.congregation_time END, prev.isha_congregation),
            TRUE, p_reviewer_id, NOW()
        FROM congregation_timings prev
        WHERE prev.mosque_id = v_update.mosque_id
          AND prev.effective_to = CURRENT_DATE  -- the row we just expired
        LIMIT 1;
    END IF;

    -- Notify the submitter
    INSERT INTO notifications (user_id, type, title, body, related_mosque_id, related_update_id)
    VALUES (
        v_update.submitted_by,
        'verified',
        CASE WHEN p_approved THEN 'Timing Update Approved' ELSE 'Timing Update Rejected' END,
        CASE WHEN p_approved
            THEN 'Your ' || v_update.prayer || ' timing update has been reviewed and approved.'
            ELSE 'Your ' || v_update.prayer || ' timing update was not approved. Notes: ' || COALESCE(p_notes, 'No notes provided.')
        END,
        v_update.mosque_id,
        p_update_id
    );
END;
$$;

-- -------------------------------------------------------------
--  fn_submit_report
--  Any user submits a timing report.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_submit_report(
    p_user_id       UUID,
    p_mosque_id     UUID,
    p_reason        report_reason,
    p_details       TEXT
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_report_id UUID;
BEGIN
    INSERT INTO timing_reports (mosque_id, reported_by, reason, details)
    VALUES (p_mosque_id, p_user_id, p_reason, p_details)
    RETURNING id INTO v_report_id;

    RETURN v_report_id;
END;
$$;

-- -------------------------------------------------------------
--  fn_resolve_report
--  Mark a report as resolved or dismissed.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_resolve_report(
    p_report_id     UUID,
    p_resolver_id   UUID,
    p_resolved      BOOLEAN
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_report timing_reports%ROWTYPE;
BEGIN
    SELECT * INTO v_report FROM timing_reports WHERE id = p_report_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Report % not found', p_report_id;
    END IF;
    IF v_report.status NOT IN ('open', 'in_review') THEN
        RAISE EXCEPTION 'Report % is already closed (status: %)', p_report_id, v_report.status;
    END IF;

    UPDATE timing_reports SET
        status      = CASE WHEN p_resolved THEN 'resolved'::report_status ELSE 'dismissed'::report_status END,
        resolved_by = p_resolver_id,
        resolved_at = NOW()
    WHERE id = p_report_id;

    -- Notify the reporter
    INSERT INTO notifications (user_id, type, title, body, related_mosque_id, related_report_id)
    VALUES (
        v_report.reported_by,
        'report',
        CASE WHEN p_resolved THEN 'Report Resolved' ELSE 'Report Closed' END,
        CASE WHEN p_resolved
            THEN 'Your timing mismatch report has been reviewed and resolved. The schedule is now up to date.'
            ELSE 'Your report has been reviewed and closed without changes at this time.'
        END,
        v_report.mosque_id,
        p_report_id
    );
END;
$$;

-- -------------------------------------------------------------
--  fn_mark_notifications_read
--  Mark a list of notifications as read for a given user.
--  Passing NULL for p_notification_ids marks ALL unread as read.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_mark_notifications_read(
    p_user_id           UUID,
    p_notification_ids  UUID[] DEFAULT NULL
)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE notifications SET is_read = TRUE
    WHERE user_id = p_user_id
      AND is_read  = FALSE
      AND (p_notification_ids IS NULL OR id = ANY(p_notification_ids));

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- -------------------------------------------------------------
--  fn_get_nearby_mosques
--  Returns mosques within p_radius_metres of a given lat/lng,
--  ordered by distance. Joins today's cached prayer timings.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_nearby_mosques(
    p_lat           NUMERIC,
    p_lng           NUMERIC,
    p_radius_metres INT DEFAULT 1000
)
RETURNS TABLE (
    mosque_id       UUID,
    google_place_id TEXT,
    name            TEXT,
    vicinity        TEXT,
    lat             NUMERIC,
    lng             NUMERIC,
    distance_m      FLOAT,
    fajr            TIME,
    dhuhr           TIME,
    asr             TIME,
    maghrib         TIME,
    isha            TIME,
    timings_verified BOOLEAN
) LANGUAGE sql STABLE AS $$
    SELECT
        m.id,
        m.google_place_id,
        m.name,
        m.vicinity,
        m.lat,
        m.lng,
        -- Haversine approximation in metres
        (point(m.lng, m.lat) <@> point(p_lng, p_lat)) * 1609.344  AS distance_m,
        pt.fajr,
        pt.dhuhr,
        pt.asr,
        pt.maghrib,
        pt.isha,
        ct.is_verified AS timings_verified
    FROM mosques m
    LEFT JOIN prayer_timings pt
        ON pt.mosque_id = m.id
        AND pt.date = CURRENT_DATE
        AND pt.expires_at > NOW()
    LEFT JOIN congregation_timings ct
        ON ct.mosque_id = m.id
        AND ct.effective_to IS NULL
    WHERE
        (point(m.lng, m.lat) <@> point(p_lng, p_lat)) * 1609.344 <= p_radius_metres
    ORDER BY distance_m;
$$;

-- -------------------------------------------------------------
--  fn_purge_expired_timings
--  Housekeeping — delete cached prayer timing rows that have expired.
--  Intended to be run nightly via pg_cron or similar.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_purge_expired_timings()
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM prayer_timings WHERE expires_at < NOW();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- -------------------------------------------------------------
--  fn_set_volunteer_status
--  Toggle volunteer mode for a user, syncing volunteer_since.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_volunteer_status(
    p_user_id       UUID,
    p_is_volunteer  BOOLEAN
)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO user_profiles (user_id, is_volunteer, volunteer_since)
    VALUES (
        p_user_id,
        p_is_volunteer,
        CASE WHEN p_is_volunteer THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        is_volunteer    = EXCLUDED.is_volunteer,
        volunteer_since = CASE
            WHEN EXCLUDED.is_volunteer AND user_profiles.volunteer_since IS NULL THEN NOW()
            WHEN NOT EXCLUDED.is_volunteer THEN NULL
            ELSE user_profiles.volunteer_since
        END,
        updated_at      = NOW();
END;
$$;
