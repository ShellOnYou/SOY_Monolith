"use strict";
const debug = require( "debug" )( "ModelExercise" );
const Model = require( "./Model" );
const ModelDB = require( "./ModelDB" );

class ModelExercise extends Model {

  // Constructor
  constructor( data ) {
    super();
    this.ex_id = data.ex_id;
    this.template_statement = data.template_statement;
    this.template_archive = data.template_archive;
    this.statement_creation_script = data.statement_creation_script;
    this.marking_script = data.marking_script;
    this.state = data.state;
    this.author = data.author;
    this.name = data.name;
    this.locale = data.locale;
    this.ref_id = data.ref_id;
    this.dbName = ModelExercise.dbName;
    this.keys = ModelExercise.keys;
    this.locKey = ModelExercise.locKey;
  }

  // A class method for checking if an exercice with the same name exists
  static async read( name ) {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM " + this.dbName + " WHERE " + "name = $1;";
      const res = await client.query( sql, [ name ] );
      debug( "read : SUCCESS" );
      return res.rows[ 0 ];
    } catch ( err ) {
      debug( "read : ERROR " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }

  

// Getting an exercise from its ex_id
  static async readById( id ) {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM " + this.dbName + " WHERE " + "ex_id = $1;";
      const res = await client.query( sql, [ id ] );
      debug( "read : SUCCESS" );
      return res.rows[ 0 ];
    } catch ( err ) {
      debug( "read : ERROR " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }

  static async readAll(){
    debug("readAll ( " + this.dbName + ")");
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT ex_id, template_statement, state, author, name, locale, ref_id FROM " + this.dbName + ";"
      const res = await client.query(sql);
      debug(" read : SUCCESS");
      let rows = res.rows
      let p = []

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        p.push(new Promise(async (resolve, reject) => {
          if(row.ref_id){
            let t = await client.query("SELECT ex_id, name FROM " + this.dbName + " WHERE ex_id = $1;", [row.ref_id])
            if(t && t.rows && t.rows.length > 0){
              rows[i].ref_exercise = t.rows[0]
            }
            resolve()
          } else {
            resolve()
          }
        }))
      }

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        rows[i].skills = []
        p.push(new Promise(async (resolve, reject) => {
          let t = await client.query(`
            SELECT *
            FROM exerciselevel el
            JOIN skill s ON el.skill_code = s.skill_code
            WHERE ex_id = ${row.ex_id}
          `)
          if(t && t.rows && t.rows.length > 0){
            rows[i].skills.push(...t.rows)
          }
          resolve()
        }))
      }

      await Promise.all(p)
      return rows
    } catch (err) {
      debug( "read : ERROR " + err.stack);
      return false
    } finally {
      client.release();
    }
  }
}

ModelExercise.dbName = "Exercise";
ModelExercise.keys = [
  [ "ex_id", "int" ],
  [ "template_statement", "text" ],
  [ "template_archive", "bytea" ],
  [ "state", "exo_state" ],
  [ "author", "int" ],
  [ "name", "varchar" ],
  [ "statement_creation_script", "bytea" ],
  [ "marking_script", "bytea" ],
  [ "locale", "loc" ],
  [ "ref_id", "int" ]
];
ModelExercise.locKey = "ref_id";

module.exports = ModelExercise;
