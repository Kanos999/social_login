// The one and only server function
/*jshint esversion: 6 */



exports.server = function() {

	let express = require("express"),
		app = express(),
		mysql = require("mysql"),
		//cookie = require('cookie'),
		//md5 = require("md5"),
		port = 81;

	let pool = mysql.createPool({
		connectionLimit: 5,
		host: "localhost",
		user: "kane",
		password: "kanos999",
		database: "studentprogress",
		timezone: "utc"
	});

	function dbQuery(sql, callback) {
		pool.getConnection((err, connection) => {
			if (!err) {
			connection.query(sql, function(err, rows) {
				if (!err) {
					callback(null, rows);
				}
				else {
					callback(err);
				}
			});
			connection.release();
		}
	});
	}


	app.get("/profileManager", (req, res) => {
		let action = req.query.action,
		sql;

	switch (action) {
		case "checkProfile":
			sql = `SELECT * from profiles WHERE (username = '${req.query.emailOrUsername}' OR email = '${req.query.emailOrUsername}') AND password = '${req.query.password}'`;
			dbQuery(sql, function(err, rows) {
				let result = { success: false };
				if (rows.length) {
					result.success = true;
					res.cookie("username", rows[0].username);
					res.cookie("password", rows[0].password);
				}
				res.json(result);
			});
			break;

		case "addProfile":
			sql = `SELECT * from profiles WHERE username = '${req.query.username}' OR email = '${req.query.email}'`;
			dbQuery(sql, function(err, rows) {
				let result = { success: true };
				if (rows.length) result.success = false;
				else {
					sql = `INSERT INTO profiles (username, email, password) VALUES ('${req.query.username}', '${req.query.email}', '${req.query.password}')`;
					dbQuery(sql, function(err, rows) {});
					res.cookie("username", req.query.username);
					res.cookie("password", req.query.password);
				}
				res.json(result);
			});
			break;

		case "changePassword":
			res.cookie("password", req.query.password);
			sql = `UPDATE profiles SET password = '${req.query.password}' WHERE username = '${req.query.username}'`;
			dbQuery(sql, function(err, rows) {});
			res.json({ success: true });
			break;
	}
});

	app.get("/subjectMarks", (req, res) => {
		let action = req.query.action,
		sql;

	switch (action) {
		case "getSubjects":
			//sql = `SELECT * from subjects WHERE owner = '${req.query.username}'`;
			sql = `SELECT subjects.subject, subjects.serial, marks.mark
						FROM subjects 
						LEFT JOIN marks on marks.subjectSerial = subjects.serial 
						WHERE subjects.owner='${req.query.username}'`;
			dbQuery(sql, function(err, rows) {
				// following will be an array of {
				//		subject,
				//		serial,
				//		mark,
				//		numRecords
				// }
				let subjectsList = [];
				rows.forEach(row => {
					let subject = subjectsList.filter(s => s.serial === row.serial)[0];
				if (!subject) {
					subject = {
						subject: row.subject,
						serial: row.serial,
						mark: 0,
						numRecords: 0
					};
					subjectsList.push(subject);
				}
				subject.mark += row.mark;
				if(row.mark !== null) subject.numRecords++;
			});
				subjectsList.forEach(s => {
					s.average = s.numRecords ? (s.mark / s.numRecords).toFixed(0) : 0;
			});
				res.json(subjectsList);
			});
			break;

		case "addSubject":
			sql = `INSERT INTO subjects (owner, subject) VALUES ('${req.query.username}', '${req.query.subject}')`;
			dbQuery(sql, function(err, rows) { if(!err) res.json({success: true}); });
			break;

		case "editSubject":
			sql = `UPDATE subjects SET subject = '${req.query.subject}' WHERE serial = '${req.query.serial}' AND owner = '${req.query.username}'`;
			dbQuery(sql, function(err, rows) {
				if(!err) res.json({ success:true });
			});
			break;

		case "removeSubject":
			sql = `DELETE FROM subjects WHERE serial = '${req.query.serial}' AND owner = '${req.query.username}'`;
			dbQuery(sql, function(err, rows) {
				if(!err) res.json({ success:true });
			});
			break;

		case "getSubjectMarks":
			sql = `SELECT * from marks WHERE owner = '${req.query.username}' AND subjectSerial = '${req.query.subject}'`;
			dbQuery(sql, function(err, rows) {
				res.json(rows);
			});
			break;

		case "submitMark":
			sql = `INSERT INTO marks (owner, subjectSerial, mark, topic, date) VALUES ('${req.query.username}', '${req.query.subject}', '${req.query.mark}', '${req.query.topic}', '${req.query.date}')`;
			dbQuery(sql, function(err, rows) {
				if(!err) res.json({ success : true });
			});
			break;
	}
});



	// Where static content is served from.
	app.use(express.static(__dirname + "/../static/", { index: "index.html" }));

	// Start server
	app.listen(port);
	console.log("Starting server on port", port);
};
