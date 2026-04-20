-- =============================================================
--  Salah Time — PostgreSQL 18 Schema
--  Extensions → Enums → Tables → Indexes → Triggers → Views → Functions
-- =============================================================

CREATE EXTENSION IF NOT EXISTS "pg_trgm";           -- trigram search on mosque names
CREATE EXTENSION IF NOT EXISTS "cube" CASCADE;       -- required by earthdistance
CREATE EXTENSION IF NOT EXISTS "earthdistance";      -- <@> proximity operator

-- uuidv7() is built-in from PostgreSQL 17+; no extension needed.

-- =============================================================
--  ENUMS
-- =============================================================

CREATE TYPE gender_type       AS ENUM ('male', 'female', 'prefer_not_to_say');
CREATE TYPE prayer_name       AS ENUM ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha');
CREATE TYPE update_status     AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_reason     AS ENUM (
    'incorrect_adhan', 'incorrect_congregation',
    'missing_timing', 'outdated_schedule',
    'details_mismatch', 'other'
);
CREATE TYPE report_status     AS ENUM ('open', 'in_review', 'resolved', 'dismissed');
CREATE TYPE notification_type AS ENUM ('update', 'report', 'verified', 'nearby', 'system');

-- =============================================================
--  TABLES
-- =============================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT uuidv7(),
    email           TEXT        NOT NULL,
    password_hash   TEXT        NOT NULL,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

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
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mosque data cached from Google Places API
CREATE TABLE mosques (
    id                  UUID          PRIMARY KEY DEFAULT uuidv7(),
    google_place_id     TEXT          NOT NULL,
    name                TEXT          NOT NULL,
    vicinity            TEXT,
    lat                 NUMERIC(10,7) NOT NULL,
    lng                 NUMERIC(10,7) NOT NULL,
    place_types         TEXT[],
    last_fetched_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT uq_mosques_place_id UNIQUE (google_place_id)
);

-- Prayer times cached from the Aladhan API (one row per mosque/date/method)
-- CREATE TABLE prayer_timings (
--     id              UUID        PRIMARY KEY DEFAULT uuidv7(),
--     mosque_id       UUID        NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
--     date            DATE        NOT NULL,
--     method          SMALLINT    NOT NULL DEFAULT 2,
--     fajr            TIME        NOT NULL,
--     sunrise         TIME        NOT NULL,
--     dhuhr           TIME        NOT NULL,
--     asr             TIME        NOT NULL,
--     sunset          TIME        NOT NULL,
--     maghrib         TIME        NOT NULL,
--     isha            TIME        NOT NULL,
--     imsak           TIME        NOT NULL,
--     midnight        TIME        NOT NULL,
--     hijri_day       SMALLINT    NOT NULL,
--     hijri_month_num SMALLINT    NOT NULL,
--     hijri_month_en  TEXT        NOT NULL,
--     hijri_month_ar  TEXT        NOT NULL,
--     hijri_year      INT         NOT NULL,
--     fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
--     -- expires at midnight of the next calendar day
--     expires_at      TIMESTAMPTZ NOT NULL GENERATED ALWAYS AS ((date + 1)::TIMESTAMPTZ) STORED,

--     CONSTRAINT uq_prayer_timings UNIQUE (mosque_id, date, method)
-- );

-- Community congregation times — full history, one active row per mosque (effective_to IS NULL)
-- CREATE TABLE congregation_timings (
--     id                      UUID        PRIMARY KEY DEFAULT uuidv7(),
--     mosque_id               UUID        NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
--     submitted_by            UUID        NOT NULL REFERENCES users(id),
--     fajr_congregation       TIME        NOT NULL,
--     dhuhr_congregation      TIME        NOT NULL,
--     asr_congregation        TIME        NOT NULL,
--     maghrib_congregation    TIME        NOT NULL,
--     isha_congregation       TIME        NOT NULL,
--     is_verified             BOOLEAN     NOT NULL DEFAULT FALSE,
--     verified_by             UUID        REFERENCES users(id),
--     verified_at             TIMESTAMPTZ,
--     effective_from          DATE        NOT NULL DEFAULT CURRENT_DATE,
--     effective_to            DATE,
--     created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

--     CONSTRAINT chk_effective_range CHECK (effective_to IS NULL OR effective_to >= effective_from),
--     CONSTRAINT chk_verified_fields CHECK (
--         (is_verified = FALSE) OR (verified_by IS NOT NULL AND verified_at IS NOT NULL)
--     )
-- );

-- Volunteer submissions for individual prayer corrections
CREATE TABLE timing_updates (
    id                  UUID          PRIMARY KEY DEFAULT uuidv7(),
    mosque_id           UUID          NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    submitted_by        UUID          NOT NULL REFERENCES users(id),
    prayer              prayer_name   NOT NULL,
    adhan_time          TIME          NOT NULL,
    congregation_time   TIME          NOT NULL,
    status              update_status NOT NULL DEFAULT 'pending',
    reviewer_notes      TEXT,
    reviewed_by         UUID          REFERENCES users(id),
    reviewed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT chk_review_fields CHECK (
        (status = 'pending') OR (reviewed_by IS NOT NULL AND reviewed_at IS NOT NULL)
    )
);

CREATE TABLE timing_reports (
    id              UUID          PRIMARY KEY DEFAULT uuidv7(),
    mosque_id       UUID          NOT NULL REFERENCES mosques(id) ON DELETE CASCADE,
    reported_by     UUID          NOT NULL REFERENCES users(id),
    reason          report_reason NOT NULL,
    details         TEXT          NOT NULL CHECK (char_length(details) BETWEEN 15 AND 500),
    status          report_status NOT NULL DEFAULT 'open',
    resolved_by     UUID          REFERENCES users(id),
    resolved_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),

    CONSTRAINT chk_resolution_fields CHECK (
        (status IN ('open', 'in_review')) OR (resolved_by IS NOT NULL AND resolved_at IS NOT NULL)
    )
);

CREATE TABLE notifications (
    id                  UUID                PRIMARY KEY DEFAULT uuidv7(),
    user_id             UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type                notification_type   NOT NULL,
    title               TEXT                NOT NULL,
    body                TEXT                NOT NULL,
    related_mosque_id   UUID                REFERENCES mosques(id) ON DELETE SET NULL,
    related_update_id   UUID                REFERENCES timing_updates(id) ON DELETE SET NULL,
    related_report_id   UUID                REFERENCES timing_reports(id) ON DELETE SET NULL,
    is_read             BOOLEAN             NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT now()
);

-- =============================================================
--  INDEXES
-- =============================================================

-- Users: email lookup on login
CREATE INDEX idx_users_email ON users (email);

-- Mosques: full-text name search + geo proximity
CREATE INDEX idx_mosques_name_trgm ON mosques USING gin (name gin_trgm_ops);
CREATE INDEX idx_mosques_location  ON mosques USING gist (ll_to_earth(lat::float8, lng::float8));

-- Prayer timings: primary access pattern + cache eviction
-- CREATE INDEX idx_prayer_timings_lookup ON prayer_timings (mosque_id, date DESC)
--     INCLUDE (fajr, dhuhr, asr, maghrib, isha);
-- CREATE INDEX idx_prayer_timings_expired ON prayer_timings (expires_at)
--     WHERE expires_at < now();

-- -- Congregation timings: fast current-row lookup
-- CREATE INDEX idx_congregation_active ON congregation_timings (mosque_id)
--     WHERE effective_to IS NULL;

-- Timing updates: moderation queue + per-volunteer history
CREATE INDEX idx_timing_updates_pending  ON timing_updates (created_at) WHERE status = 'pending';
CREATE INDEX idx_timing_updates_mosque   ON timing_updates (mosque_id, created_at DESC);
CREATE INDEX idx_timing_updates_user     ON timing_updates (submitted_by, created_at DESC);

-- Timing reports: moderation queue + per-mosque summary
CREATE INDEX idx_timing_reports_open   ON timing_reports (created_at) WHERE status IN ('open', 'in_review');
CREATE INDEX idx_timing_reports_mosque ON timing_reports (mosque_id, created_at DESC);
CREATE INDEX idx_timing_reports_user   ON timing_reports (reported_by, created_at DESC);

-- Notifications: unread feed (most common query)
CREATE INDEX idx_notifications_unread ON notifications (user_id, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_all    ON notifications (user_id, created_at DESC);

-- =============================================================
--  TRIGGERS
-- =============================================================

-- CREATE OR REPLACE FUNCTION fn_set_updated_at()
-- RETURNS TRIGGER LANGUAGE plpgsql AS $$
-- BEGIN
--     NEW.updated_at = now();
--     RETURN NEW;
-- END;
-- $$;

-- CREATE TRIGGER trg_users_updated_at
--     BEFORE UPDATE ON users
--     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- CREATE TRIGGER trg_mosques_updated_at
--     BEFORE UPDATE ON mosques
--     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- CREATE TRIGGER trg_user_profiles_updated_at
--     BEFORE UPDATE ON user_profiles
--     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- CREATE TRIGGER trg_timing_updates_updated_at
--     BEFORE UPDATE ON timing_updates
--     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- CREATE TRIGGER trg_timing_reports_updated_at
--     BEFORE UPDATE ON timing_reports
--     FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- =============================================================
--  VIEWS
-- =============================================================

-- Today's calculated + verified congregation times for every mosque
CREATE OR REPLACE VIEW v_mosque_current_timings AS
SELECT
    m.id                AS mosque_id,
    m.google_place_id,
    m.name,
    m.vicinity,
    m.lat,
    m.lng,
    pt.fajr,    pt.sunrise, pt.dhuhr,   pt.asr,
    pt.sunset,  pt.maghrib, pt.isha,
    pt.hijri_day, pt.hijri_month_en, pt.hijri_month_ar, pt.hijri_year,
    ct.fajr_congregation,   ct.dhuhr_congregation,
    ct.asr_congregation,    ct.maghrib_congregation,
    ct.isha_congregation,
    ct.is_verified      AS congregation_verified,
    ct.verified_at
FROM mosques m
LEFT JOIN prayer_timings pt
    ON  pt.mosque_id = m.id
    AND pt.date      = CURRENT_DATE
    AND pt.expires_at > now()
LEFT JOIN congregation_timings ct
    ON  ct.mosque_id    = m.id
    AND ct.effective_to IS NULL
    AND ct.is_verified  = TRUE;

-- Per-user contribution stats for the Home dashboard
CREATE OR REPLACE VIEW v_user_contribution_stats AS
SELECT
    u.id                                                                AS user_id,
    u.email,
    COALESCE(up.is_volunteer, FALSE)                                    AS is_volunteer,
    COUNT(DISTINCT tu.id)                                               AS timings_updated,
    COUNT(DISTINCT tr.id)                                               AS reports_submitted,
    COUNT(DISTINCT tr.id) FILTER (WHERE tr.status = 'resolved')        AS reports_resolved,
    COUNT(DISTINCT ct.id) FILTER (WHERE ct.is_verified)                AS mosques_verified,
    COUNT(DISTINCT tu.id) FILTER (WHERE tu.created_at >= now() - INTERVAL '7 days') AS updates_this_week,
    GREATEST(MAX(tu.created_at), MAX(tr.created_at))                   AS last_active_at
FROM users u
LEFT JOIN user_profiles up         ON up.user_id      = u.id
LEFT JOIN timing_updates tu        ON tu.submitted_by  = u.id AND tu.status = 'approved'
LEFT JOIN timing_reports tr        ON tr.reported_by   = u.id
LEFT JOIN congregation_timings ct  ON ct.submitted_by  = u.id
GROUP BY u.id, u.email, up.is_volunteer;

-- Open/in-review report counts per mosque — moderation queue
CREATE OR REPLACE VIEW v_mosque_report_summary AS
SELECT
    m.id                                                                    AS mosque_id,
    m.name,
    m.vicinity,
    COUNT(*) FILTER (WHERE tr.status = 'open')                             AS open_reports,
    COUNT(*) FILTER (WHERE tr.status = 'in_review')                        AS in_review_reports,
    MAX(tr.created_at)                                                      AS latest_report_at
FROM mosques m
JOIN timing_reports tr ON tr.mosque_id = m.id
WHERE tr.status IN ('open', 'in_review')
GROUP BY m.id, m.name, m.vicinity;

-- Notifications with mosque name denormalised for direct display
CREATE OR REPLACE VIEW v_user_notifications AS
SELECT
    n.id,
    n.user_id,
    n.type,
    n.title,
    n.body,
    n.is_read,
    n.created_at,
    m.name            AS mosque_name,
    m.google_place_id AS mosque_place_id
FROM notifications n
LEFT JOIN mosques m ON m.id = n.related_mosque_id;

-- =============================================================
--  FUNCTIONS
-- =============================================================

-- Upsert a mosque from a Google Places API payload
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
    v_id UUID;
BEGIN
    INSERT INTO mosques (
        google_place_id, name, vicinity, lat, lng,
        place_types, rating, user_ratings_total, last_fetched_at
    )
    VALUES (
        p_google_place_id, p_name, p_vicinity, p_lat, p_lng,
        p_place_types, p_rating, p_user_ratings_total, now()
    )
    ON CONFLICT (google_place_id) DO UPDATE SET
        name                = EXCLUDED.name,
        vicinity            = EXCLUDED.vicinity,
        lat                 = EXCLUDED.lat,
        lng                 = EXCLUDED.lng,
        place_types         = EXCLUDED.place_types,
        rating              = EXCLUDED.rating,
        user_ratings_total  = EXCLUDED.user_ratings_total,
        last_fetched_at     = now(),
        updated_at          = now()
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- Cache Aladhan API response for one mosque/date/method
CREATE OR REPLACE FUNCTION fn_upsert_prayer_timings(
    p_mosque_id       UUID,      p_date            DATE,
    p_method          SMALLINT,
    p_fajr            TIME,      p_sunrise         TIME,
    p_dhuhr           TIME,      p_asr             TIME,
    p_sunset          TIME,      p_maghrib         TIME,
    p_isha            TIME,      p_imsak           TIME,
    p_midnight        TIME,
    p_hijri_day       SMALLINT,  p_hijri_month_num SMALLINT,
    p_hijri_month_en  TEXT,      p_hijri_month_ar  TEXT,
    p_hijri_year      INT
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO prayer_timings (
        mosque_id, date, method,
        fajr, sunrise, dhuhr, asr, sunset, maghrib, isha, imsak, midnight,
        hijri_day, hijri_month_num, hijri_month_en, hijri_month_ar, hijri_year
    )
    VALUES (
        p_mosque_id, p_date, p_method,
        p_fajr, p_sunrise, p_dhuhr, p_asr, p_sunset, p_maghrib, p_isha, p_imsak, p_midnight,
        p_hijri_day, p_hijri_month_num, p_hijri_month_en, p_hijri_month_ar, p_hijri_year
    )
    ON CONFLICT (mosque_id, date, method) DO UPDATE SET
        fajr            = EXCLUDED.fajr,    sunrise         = EXCLUDED.sunrise,
        dhuhr           = EXCLUDED.dhuhr,   asr             = EXCLUDED.asr,
        sunset          = EXCLUDED.sunset,  maghrib         = EXCLUDED.maghrib,
        isha            = EXCLUDED.isha,    imsak           = EXCLUDED.imsak,
        midnight        = EXCLUDED.midnight,
        hijri_day       = EXCLUDED.hijri_day,
        hijri_month_num = EXCLUDED.hijri_month_num,
        hijri_month_en  = EXCLUDED.hijri_month_en,
        hijri_month_ar  = EXCLUDED.hijri_month_ar,
        hijri_year      = EXCLUDED.hijri_year,
        fetched_at      = now()
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- Volunteer submits a timing correction for one prayer
CREATE OR REPLACE FUNCTION fn_submit_timing_update(
    p_user_id           UUID,
    p_mosque_id         UUID,
    p_prayer            prayer_name,
    p_adhan_time        TIME,
    p_congregation_time TIME
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_id UUID;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles WHERE user_id = p_user_id AND is_volunteer = TRUE
    ) THEN
        RAISE EXCEPTION 'user % is not a registered volunteer', p_user_id
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    INSERT INTO timing_updates (mosque_id, submitted_by, prayer, adhan_time, congregation_time)
    VALUES (p_mosque_id, p_user_id, p_prayer, p_adhan_time, p_congregation_time)
    RETURNING id INTO v_id;

    -- Notify volunteer moderators (excluding the submitter)
    INSERT INTO notifications (user_id, type, title, body, related_mosque_id, related_update_id)
    SELECT
        up.user_id,
        'update',
        'New Timing Update',
        'A volunteer submitted updated ' || p_prayer || ' timings for review.',
        p_mosque_id,
        v_id
    FROM user_profiles up
    WHERE up.is_volunteer = TRUE
      AND up.user_id <> p_user_id
    LIMIT 20;

    RETURN v_id;
END;
$$;

-- Moderator approves or rejects a pending update
CREATE OR REPLACE FUNCTION fn_review_timing_update(
    p_update_id   UUID,
    p_reviewer_id UUID,
    p_approved    BOOLEAN,
    p_notes       TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_upd timing_updates%ROWTYPE;
BEGIN
    SELECT * INTO v_upd FROM timing_updates WHERE id = p_update_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'timing update % not found', p_update_id;
    END IF;
    IF v_upd.status <> 'pending' THEN
        RAISE EXCEPTION 'update % already reviewed (status: %)', p_update_id, v_upd.status;
    END IF;

    UPDATE timing_updates SET
        status         = CASE WHEN p_approved THEN 'approved'::update_status ELSE 'rejected'::update_status END,
        reviewed_by    = p_reviewer_id,
        reviewed_at    = now(),
        reviewer_notes = p_notes
    WHERE id = p_update_id;

    IF p_approved THEN
        -- Close the currently active congregation timing
        UPDATE congregation_timings
        SET effective_to = CURRENT_DATE
        WHERE mosque_id = v_upd.mosque_id AND effective_to IS NULL;

        -- Insert new row carrying forward unaffected prayers
        INSERT INTO congregation_timings (
            mosque_id, submitted_by,
            fajr_congregation, dhuhr_congregation, asr_congregation,
            maghrib_congregation, isha_congregation,
            is_verified, verified_by, verified_at
        )
        SELECT
            v_upd.mosque_id,
            v_upd.submitted_by,
            CASE WHEN v_upd.prayer = 'fajr'    THEN v_upd.congregation_time ELSE prev.fajr_congregation    END,
            CASE WHEN v_upd.prayer = 'dhuhr'   THEN v_upd.congregation_time ELSE prev.dhuhr_congregation   END,
            CASE WHEN v_upd.prayer = 'asr'     THEN v_upd.congregation_time ELSE prev.asr_congregation     END,
            CASE WHEN v_upd.prayer = 'maghrib' THEN v_upd.congregation_time ELSE prev.maghrib_congregation END,
            CASE WHEN v_upd.prayer = 'isha'    THEN v_upd.congregation_time ELSE prev.isha_congregation    END,
            TRUE, p_reviewer_id, now()
        FROM congregation_timings prev
        WHERE prev.mosque_id    = v_upd.mosque_id
          AND prev.effective_to = CURRENT_DATE
        LIMIT 1;
    END IF;

    INSERT INTO notifications (user_id, type, title, body, related_mosque_id, related_update_id)
    VALUES (
        v_upd.submitted_by,
        'verified',
        CASE WHEN p_approved THEN 'Timing Update Approved' ELSE 'Timing Update Rejected' END,
        CASE WHEN p_approved
            THEN 'Your ' || v_upd.prayer || ' timing update has been approved.'
            ELSE 'Your ' || v_upd.prayer || ' timing update was rejected. ' || COALESCE('Notes: ' || p_notes, '')
        END,
        v_upd.mosque_id,
        p_update_id
    );
END;
$$;

-- Any user submits an inaccuracy report
CREATE OR REPLACE FUNCTION fn_submit_report(
    p_user_id   UUID,
    p_mosque_id UUID,
    p_reason    report_reason,
    p_details   TEXT
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO timing_reports (mosque_id, reported_by, reason, details)
    VALUES (p_mosque_id, p_user_id, p_reason, p_details)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$;

-- Moderator resolves or dismisses a report
CREATE OR REPLACE FUNCTION fn_resolve_report(
    p_report_id   UUID,
    p_resolver_id UUID,
    p_resolved    BOOLEAN
)
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
    v_rep timing_reports%ROWTYPE;
BEGIN
    SELECT * INTO v_rep FROM timing_reports WHERE id = p_report_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'report % not found', p_report_id;
    END IF;
    IF v_rep.status NOT IN ('open', 'in_review') THEN
        RAISE EXCEPTION 'report % is already closed (status: %)', p_report_id, v_rep.status;
    END IF;

    UPDATE timing_reports SET
        status      = CASE WHEN p_resolved THEN 'resolved'::report_status ELSE 'dismissed'::report_status END,
        resolved_by = p_resolver_id,
        resolved_at = now()
    WHERE id = p_report_id;

    INSERT INTO notifications (user_id, type, title, body, related_mosque_id, related_report_id)
    VALUES (
        v_rep.reported_by,
        'report',
        CASE WHEN p_resolved THEN 'Report Resolved' ELSE 'Report Dismissed' END,
        CASE WHEN p_resolved
            THEN 'Your report has been reviewed and the schedule has been corrected.'
            ELSE 'Your report has been reviewed and closed without changes at this time.'
        END,
        v_rep.mosque_id,
        p_report_id
    );
END;
$$;

-- Mark notifications as read; pass NULL ids to mark all unread for the user
CREATE OR REPLACE FUNCTION fn_mark_notifications_read(
    p_user_id          UUID,
    p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    UPDATE notifications SET is_read = TRUE
    WHERE user_id  = p_user_id
      AND is_read  = FALSE
      AND (p_notification_ids IS NULL OR id = ANY(p_notification_ids));
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- Set/unset volunteer status, preserving the original volunteer_since date
CREATE OR REPLACE FUNCTION fn_set_volunteer_status(p_user_id UUID, p_is_volunteer BOOLEAN)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO user_profiles (user_id, is_volunteer, volunteer_since)
    VALUES (
        p_user_id,
        p_is_volunteer,
        CASE WHEN p_is_volunteer THEN now() ELSE NULL END
    )
    ON CONFLICT (user_id) DO UPDATE SET
        is_volunteer    = EXCLUDED.is_volunteer,
        volunteer_since = CASE
            WHEN EXCLUDED.is_volunteer AND user_profiles.volunteer_since IS NULL THEN now()
            WHEN NOT EXCLUDED.is_volunteer                                        THEN NULL
            ELSE user_profiles.volunteer_since
        END,
        updated_at = now();
END;
$$;

-- Return mosques within p_radius_metres ordered by distance
CREATE OR REPLACE FUNCTION fn_get_nearby_mosques(
    p_lat           NUMERIC,
    p_lng           NUMERIC,
    p_radius_metres INT DEFAULT 1000
)
RETURNS TABLE (
    mosque_id        UUID,
    google_place_id  TEXT,
    name             TEXT,
    vicinity         TEXT,
    lat              NUMERIC,
    lng              NUMERIC,
    distance_m       FLOAT,
    fajr             TIME,
    dhuhr            TIME,
    asr              TIME,
    maghrib          TIME,
    isha             TIME,
    congregation_verified BOOLEAN
) LANGUAGE sql STABLE AS $$
    SELECT
        m.id,
        m.google_place_id,
        m.name,
        m.vicinity,
        m.lat,
        m.lng,
        earth_distance(
            ll_to_earth(m.lat::float8, m.lng::float8),
            ll_to_earth(p_lat::float8, p_lng::float8)
        )               AS distance_m,
        pt.fajr, pt.dhuhr, pt.asr, pt.maghrib, pt.isha,
        ct.is_verified  AS congregation_verified
    FROM mosques m
    LEFT JOIN prayer_timings pt
        ON  pt.mosque_id = m.id
        AND pt.date      = CURRENT_DATE
        AND pt.expires_at > now()
    LEFT JOIN congregation_timings ct
        ON  ct.mosque_id    = m.id
        AND ct.effective_to IS NULL
    WHERE earth_distance(
              ll_to_earth(m.lat::float8, m.lng::float8),
              ll_to_earth(p_lat::float8, p_lng::float8)
          ) <= p_radius_metres
    ORDER BY distance_m;
$$;

-- Housekeeping: delete expired cached prayer timings (run nightly via pg_cron)
CREATE OR REPLACE FUNCTION fn_purge_expired_timings()
RETURNS INT LANGUAGE plpgsql AS $$
DECLARE
    v_count INT;
BEGIN
    DELETE FROM prayer_timings WHERE expires_at < now();
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;
