CREATE DATABASE ndau-dao;

CREATE TABLE proposals(
proposal_id SERIAL PRIMARY KEY,
is_approved BOOLEAN,
approved_on TIMESTAMPTZ,
heading NOT NULL TEXT,
summary TEXT,
voting_period NOT NULL INTERVAL,
)

CREATE TABLE proposal_options(
    option_id SERIAL PRIMARY KEY,
    heading NOT NULL
    proposal_id id REFERENCES proposal_id
)

CREATE TABLE proposal_votes(
    vote_id SERIAL PRIMARY KEY,
    voter_address NOT NULL
    option_ id REFERENCES proposal_options NOT NULL
)