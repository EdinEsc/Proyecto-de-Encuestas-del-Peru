-- Fix unique constraints to allow multiple manual votes
DROP INDEX IF EXISTS uniq_vote_ip_election;
CREATE UNIQUE INDEX uniq_vote_ip_election
ON votes (election_id, ip_address)
WHERE ip_address <> '0.0.0.0'::inet;

DROP INDEX IF EXISTS uniq_vote_browser_election;
CREATE UNIQUE INDEX uniq_vote_browser_election
ON votes (election_id, browser_id)
WHERE browser_id IS NOT NULL AND browser_id <> '' AND browser_id <> 'manual-override';
