import { log } from "./deps.js";
import { db } from "./sql.js";

export class SQLiteHandler extends log.handlers.BaseHandler {
    constructor(levelName, options) {
	super(levelName, options);
	db.execute(`
CREATE TABLE IF NOT EXISTS logs(
    _id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    date TEXT NOT NULL,
    level INTEGER NOT NULL,
    msg TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS logTags(
    _id INTEGER PRIMARY KEY ASC AUTOINCREMENT,
    logId INTEGER,
    tag TEXT NOT NULL,
    FOREIGN KEY(logId) REFERENCES logs(_id),
    unique (logId, tag)
);
`);
    }
    format(logRecord) {
	return {
	    date: logRecord.datetime,
	    level: logRecord.level,
	    msg: logRecord.msg,
	    tags: logRecord.args
	};
    }
    log(log) {
	db.query('INSERT INTO logs(date, level, msg) VALUES (:date, :level, :msg);',
		 [
		     log.date,
		     log.level,
		     log.msg,
		 ],
	);
	const logId = db.lastInsertRowId;
	for (const tag of log.tags) {
	    db.query('INSERT INTO logTags (logId, tag) VALUES (?,?);',[logId, tag]);
	}
    }
}

log.setup({
    handlers: {
	console: new log.handlers.ConsoleHandler("DEBUG", {
	    formatter: (logRecord) => {
		let tags = '';
		if (logRecord.args.length) {
		    tags += '\n\t\t';
		    for (const tag of logRecord.args) {
			tags += ' '+tag;
		    }
		}
		return `[${logRecord.datetime}] <${logRecord.levelName}> ${logRecord.msg}${tags}`
	    }
	}),
	sql: new SQLiteHandler("DEBUG"),
    },
    loggers: {
	default: {
	    level: "DEBUG",
	    handlers: ["console", "sql"],
	},
    },
});

export const logger = log.getLogger();
logger.db = db;
