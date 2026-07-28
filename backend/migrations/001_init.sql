CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(180) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS election_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  parent_id UUID REFERENCES regions(id) ON DELETE SET NULL,
  level VARCHAR(30) NOT NULL CHECK (level IN ('country', 'region', 'province', 'district')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name, parent_id, level)
);

CREATE TABLE IF NOT EXISTS elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(180) UNIQUE NOT NULL,
  election_type_id UUID NOT NULL REFERENCES election_types(id),
  region_id UUID REFERENCES regions(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(160) NOT NULL,
  image_url TEXT NOT NULL,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  election_id UUID NOT NULL REFERENCES elections(id) ON DELETE CASCADE,
  ip_address INET NOT NULL,
  browser_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote_ip_election
ON votes (election_id, ip_address);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_vote_browser_election
ON votes (election_id, browser_id)
WHERE browser_id IS NOT NULL AND browser_id <> '';

CREATE INDEX IF NOT EXISTS idx_elections_active ON elections(is_active, end_date);
CREATE INDEX IF NOT EXISTS idx_candidates_election ON candidates(election_id);
CREATE INDEX IF NOT EXISTS idx_votes_election ON votes(election_id);

INSERT INTO election_types (name)
VALUES ('presidencial'), ('regional'), ('provincial'), ('distrital')
ON CONFLICT (name) DO NOTHING;
