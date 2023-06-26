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

CREATE TABLE ndau_conversion (
	id serial primary key,
	ndau_address varchar NOT NULL,
	npay_address varchar NOT NULL,
	amount numeric(16, 5) NULL DEFAULT 0,
	signature varchar not null,
	transaction_hash varchar not null,
	updatedon timestamp DEFAULT NULL,
	createdon timestamp null default CURRENT_TIMESTAMP
);