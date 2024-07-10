"use strict";
const debug = require("debug")("ModelPlageSession");
const Model = require("./Model");
const ModelDB = require("./ModelDB");

class ModelPlageSession extends Model {
  // Constructor
  constructor(data) {
    super();
    this.ps_id = data.ps_id;
    this.p_id = data.p_id;
    this.name = data.name;
    this.secret_key = data.secret_key;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.author = data.author;
    this.description = data.description;
    this.universe = data.universe;
    this.seq_id = data.seq_id;
    this.is_timed = data.is_timed;

    this.dbName = ModelPlageSession.dbName;
    this.keys = ModelPlageSession.keys;
    this.locKey = ModelPlageSession.locKey;
  }

  // List plage sessions that have an end date at least today
  static async readAvailable() {
    debug("readAvailable");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT * FROM " + this.dbName + " WHERE end_date >= now();";
      const tab = await client.query(sql);
      debug("readAvailable : SUCCESS");
      return tab.rows;
    } catch (err) {
      debug("readAvailable : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  // List plage sessions that are authored by a person
  static async readAuthoredBy(user_id) {
    debug("readAuthoredBy for user " + user_id);
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT * FROM " + this.dbName + " WHERE author=$1;";
      const tab = await client.query(sql, [user_id]);
      //const tab = await client.query( sql );
      debug("readAuthoredBy: SUCCESS");
      return tab.rows;
    } catch (err) {
      debug("readAuthoredBy: " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  // Register a student to a session
  static async addStudent(user_id, ps_id) {
    debug("Add a user to a session");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "INSERT INTO UserSession (user_id, ps_id) VALUES ($1::int, $2::int);";
      await client.query(sql, [user_id, ps_id]);
      debug("addStudent : SUCCESS");
      return true;
    } catch (err) {
      debug("addStudent : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  // Remove PlageSession where profileId match
  static async deleteByProfileId(p_id) {
    debug("Remove PlageSession where profileId match");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM PlageSession WHERE p_id = ($1::int);";
      await client.query(sql, [p_id]);
      debug("remove PlageSession : SUCCESS");
      return true;
    } catch (err) {
      debug("remove PlageSession : " + err.stack);
    }
  }

  static async quitSession(user_id, ps_id) {
    debug("Quit a session");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM usersession WHERE user_id = $1::int AND ps_id = $2::int;";
      await client.query(sql, [user_id, ps_id]);
      debug("Quit session success");
      return true;
    } catch (err) {
      debug("Quit session failed : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  // Remove a student from a session
  static async unsubscribeStudent(user_id, ps_id) {
    debug("Unsubscribe a user from a session he registered");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM UserSession WHERE user_id = ($1::int);";
      await client.query(sql, [user_id]);
      debug("removeStudent from session: SUCCESS");
      return true;
    } catch (err) {
      debug("removeStudent from session: " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  // Read all sesssions to which a student subscribed (registered)
  static async readStudentSub(user_id) {
    debug("Get all session_id to wihch a student subscribed");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT ps_id FROM UserSession WHERE user_id=$1::int;";
      const res = await client.query(sql, [user_id]);
      debug("readStudentSub : SUCCESS");
      return res.rows;
    } catch (err) {
      debug("readStudentSub : " + err.stack);
    } finally {
      client.end();
    }
  }

  //Return the sequence id for a session
  static async readSessionSequence(sessionId) {
    debug("Return the sequence id for a session");
    const client = await ModelDB.connect_to_db();

    try {
      const sql = "SELECT seq_id FROM plagesession WHERE ps_id= $1::int;";
      const res = await client.query(sql, [sessionId]);
      return res.rows;
    } catch (err) {
      debug("readSessionSequence : " + err.stack);
    } finally {
      client.end();
    }
  }

  static async verifySubscription(session, user) {
    debug(`Verify subscription of student ${JSON.stringify(user)} to session ${session.ps_id}`);
    if (user) {
      const client = await ModelDB.connect_to_db();
      try {
        const sql =
          "SELECT count(*) FROM UserSession WHERE user_id=$1::int AND ps_id=$2::int;";
        const res = await client.query(sql, [user.user_id, session.ps_id]);
        debug("readStudentSub : SUCCESS");
        debug("res.rows = ", res.rows);
        return res.rows[0].count > 0;
      } catch (err) {
        debug("readStudentSub : " + err.stack);
        return false;
      } finally {
        client.end();
      }
    } else {
      debug("no user detected");
      return false;
    }
  }

  // Return infos of all students subscribed to a particular session
  static async readSubscribed(ps_id) {
    const client = await ModelDB.connect_to_db();
    try {
      const sql =
        "SELECT userplage.user_id, userplage.firstname, userplage.lastname, userplage.student_number " +
        "FROM UserSession, userplage WHERE usersession.ps_id=$1::int AND usersession.user_id = userplage.user_id;";
      const res = await client.query(sql, [ps_id]);
      debug("readsubscribed : SUCCESS");
      return res.rows;
    } catch (err) {
      debug("readsubscribed : " + err.stack);
    } finally {
      client.end();
    }
  }

  static async numberOfStudents(ps_id) {
    const client = await ModelDB.connect_to_db();
    let numberOfStudent;
    debug(`asked to count *students* registered to session ${ps_id}`)
    try {
      const sql =
        "SELECT count(*) FROM UserSession, userplage WHERE usersession.ps_id = $1::int AND usersession.user_id = userplage.user_id AND userplage.role_id = 3 ;";
      //debug(sql)
      const res = await client.query(sql, [ps_id]);
      console.log(res);
      debug("read students subscribed : SUCCESS");
      //debug(`res is ${JSON.stringify(res)}`)
      debug(`count is ${res.rows[0].count}`)
      return res.rows[0].count;
    } catch (err) {
      debug("read student subscribed : " + err.stack);
    } finally {
      client.end();
    }
  }
}

ModelPlageSession.dbName = "PlageSession";
ModelPlageSession.keys = [
  ["ps_id", "int"],
  ["p_id", "int"],
  ["name", "varchar"],
  ["secret_key", "varchar"],
  ["start_date", "date"],
  ["end_date", "date"],
  ["author", "int"],
  ["description", "text"],
  ["universe", "text"],
  ["seq_id", "integer"],
  ["is_timed", "boolean"],
];
ModelPlageSession.locKey = undefined;

module.exports = ModelPlageSession;
