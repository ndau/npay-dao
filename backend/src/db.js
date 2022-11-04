import keymirror from 'keymirror';
import queryResult from 'pg-promise';

import * as Logger from './utils/logger';

const initOptions = {};

if (process.env.NODE_ENV === 'test') {
	initOptions.noLocking = true;
}

export const pgp = require('pg-promise')(initOptions);

const user = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const dbName = process.env.DB_DATABASE;

const conString = `postgres://${user}:${password}@${host}:${port}/${dbName}`;

Logger.info(
	`Trying to connect to database ${conString.substring(
		conString.lastIndexOf('/') + 1
	)}...`
);

const db = pgp(conString);

export const schema = dbName;

export const table = keymirror({
	votes: null,
});

export const RESULT = queryResult;
export const QUERY = keymirror({
	any: null,
	none: null,
	one: null,
	oneOrNone: null,
	many: null,
	manyOrNone: null,
	result: null,
});

export const db_query = async (
	method = QUERY.any,
	text,
	values = [],
	isTransaction = false,
	errMsg = ''
) => {
	if (isTransaction) {
		return (t) => t[method](text, values);
	} else {
		try {
			const res = await db[method]({
				text,
				values,
			});

			return res;
		} catch (err) {
			const e = enrich(err, `SQL failed`, {
				method,
				text,
				values,
				isTransaction,
			});

			Logger.error('db_query failed', e);
		}
	}
};

export const db_call = async (
	result = RESULT.any,
	type = 'func',
	method,
	values = [],
	errMsg = ''
) => {
	try {
		return await db[type](method, values, result);
	} catch (err) {
		const e = enrich(err, `SQL failed to call ${type}`, {
			type,
			method,
			values,
			result,
		});

		Logger.error(errMsg || 'db_call failed', e);
	}
};

function enrich(err, text, parametters = {}) {
	let correction;
	switch (err.code) {
		case 'ENOTFOUND':
			correction = 'Check connection to your database server';
			break;
		default:
	}

	let e = new Error(text);
	Error.captureStackTrace(e, Error);
	e.innerError = err;

	e.parametters = parametters;
	e.correction = correction;

	return e;
}

export const generateUpdatedSet = (options) => {
	const keys = Object.keys(options);
	return keys.reduce(
		(acc, k) => {
			const v = options[k];
			if (v !== undefined) {
				if (!acc.columns) {
					acc = { columns: [], values: {} };
				}
				acc.columns.push(k);
				acc.values[k] = typeof v === 'string' ? v.trim() : v;
			}
			return acc;
		},
		{ updated_on: 'now()' }
	);
};

export const getConditionClause = (options) => {
	const keys = Object.keys(options);
	return keys.reduce(
		(acc, k) => {
			const v = options[k];

			acc.conditions.push(`${k} = $${++acc.count} `);
			acc.values.push(v);

			return acc;
		},
		{ count: 0, conditions: [], values: [] }
	);
};

export const trimStringProperties = (obj) => {
	const keys = Object.keys(obj);
	return keys.reduce((acc, k) => {
		const v = obj[k];
		acc[k] = typeof v === 'string' ? v.trim() : v;
		return acc;
	}, {});
};
