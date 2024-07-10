"use strict";
const debug = require("debug")("ModelSkill");
const Model = require("./Model");
const ModelDB = require("./ModelDB");

class ModelSkill extends Model {
  /// Constructor
  constructor(data) {
    super();
    this.skill_code = data.skill_code;
    this.name = data.name;
    this.th_id = data.th_id;
    this.description = data.description;
    this.locale = data.locale;
    this.ref_code = data.ref_code;

    this.dbName = ModelSkill.dbName;
    this.keys = ModelSkill.keys;
    this.locKey = ModelSkill.locKey;
  }

  static async addLinkSkillEx(ex_id, skill_code) {
    debug("Add a DB entry Ex / Skill");
    const client = await ModelDB.connect_to_db();
    try {
      const sql =
        "INSERT INTO ExerciseLevel (ex_id, skill_code, nam_id) VALUES ($1::int, $2::varchar, 1);";
      await client.query(sql, [ex_id, skill_code]);
      debug("addLinkSkillEx : SUCCESS");
      return true;
    } catch (err) {
      debug("addLinkSkillEx : ERROR " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async readWithTheme(locale){
    let tabSkill = await this.readJustLoc(locale)
    const client = await ModelDB.connect_to_db();

    for (let i = 0; i < tabSkill.length; i++) {
      const theme = await client.query("SELECT * FROM theme WHERE th_id = $1", [tabSkill[i].th_id])
      if(theme && theme.rows && theme.rows.length > 0){
        tabSkill[i].theme = theme.rows[0]
      }
    }

    client.end()
    return tabSkill
  }

  static async readExerciseLevel(skill_code, ex_id, nam_id) {
    debug("Read ExerciseLevels");
    const client = await ModelDB.connect_to_db();
    try {
      const sql =
        "SELECT * FROM ExerciseLevel WHERE skill_code = $1::varchar AND ex_id = $2::int AND nam_id = $3::int;";
      const res = await client.query(sql, [skill_code, ex_id, nam_id]);
      debug("Read ExerciseLevels : SUCCESS");
      return res.rows[0];
    } catch (err) {
      debug("Read ExerciseLevels : ERROR " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async delAllLinkEx(ex_id) {
    debug("Delete all link for ex : " + ex_id);
    const client = await ModelDB.connect_to_db();
    try {
      // TO DO: is that safe to do a pure SQL request as this? 
      // Are we fully protected against SQL injection?
      const sql = "DELETE FROM ExerciseLevel WHERE ex_id = $1::int;";
      await client.query(sql, [ex_id]);
      debug("delAllLinkEx : SUCCESS");
      return true;
    } catch (err) {
      debug("delAllLinkEx : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async delAllLinkSkill(skill_code) {
    debug("Delete all link for skill_code : " + skill_code);
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM ExerciseLevel WHERE skill_code = $1::varchar;";
      await client.query(sql, [skill_code]);
      debug("delAllLinkSkill : SUCCESS");
      return true;
    } catch (err) {
      debug("delAllLinkSkill : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async readSkillByEx(ex_id) {
    debug("Get all skills for one exercise");
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT * FROM ExerciseLevel WHERE ex_id = $1::int;";
      const res = await client.query(sql, [ex_id]);
      debug("readSkillByEx : SUCCESS");
      return res.rows;
    } catch (err) {
      debug("readSkillByEx : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }

  static async readAllByEx(ex_id, locale) {
    debug("Get all skills for one exercise");
    const client = await ModelDB.connect_to_db();
    try {
      if (typeof locale !== "undefined" && locale) {
        const sql =
          "SELECT * FROM Skill, ExerciseLevel WHERE ExerciseLevel.ex_id = $1::int AND ExerciseLevel.skill_code = Skill.skill_code AND Skill.locale = $2::loc;";
        const res = await client.query(sql, [ex_id, locale]);
        return res.rows;
      } else {
        const sql =
          "SELECT * FROM Skill, ExerciseLevel WHERE ExerciseLevel.ex_id = $1::int AND ExerciseLevel.skill_code = Skill.skill_code;";
        const res = await client.query(sql, [ex_id]);
        return res.rows;
      }
    } catch (err) {
      debug("readSkillByEx : " + err.stack);
      return false;
    } finally {
      client.end();
    }
  }
}

ModelSkill.dbName = "Skill";
ModelSkill.keys = [
  ["skill_code", "varchar"],
  ["name", "varchar"],
  ["th_id", "int"],
  ["description", "text"],
  ["locale", "loc"],
  ["ref_code", "varchar"],
];
ModelSkill.locKey = "ref_code";

module.exports = ModelSkill;
