"use strict";
const debug = require( "debug" )( "ModelCourse" );
const Model = require( "./Model" );
const ModelDB = require( "./ModelDB" );

class ModelCourse extends Model {

  // Constructor
  constructor( data ) {
    super();
    this.c_id = data.c_id;
    this.name = data.name;
    this.available = data.available;
    this.description = data.description;

    this.dbName = ModelCourse.dbName;
    this.keys = ModelCourse.keys;
    this.locKey = ModelCourse.locKey;
  }

  static async addP( c_id, p_id ) {
    debug( "Add a profile to a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "INSERT INTO CourseProfile (p_id, c_id) VALUES ($1::int, $2::int);";
      await client.query( sql, [ c_id, p_id ] );
      debug( "addP : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "addP : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async addUser( c_id, user_id ) {
    debug( "Add an user to a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "INSERT INTO UserCourse (user_id, p_id) VALUES ($1::int, $2::int);";
      await client.query( sql, [ c_id, user_id ] );
      debug( "addUser : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "addUser : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async delAllP( p_id ) {
    debug( "Delete all profiles from a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM CourseProfile WHERE p_id=$1::int;";
      await client.query( sql, [ p_id ] );
      debug( "delAllP : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "delAllP : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async delAllUser( c_id ) {
    debug( "Delete all user from a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM UserCourse WHERE p_id=$1::int;";
      await client.query( sql, [ c_id ] );
      debug( "delAllUser : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "delAllUser : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async delP( c_id, p_id ) {
    debug( "Delete a profile from a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM CourseProfile WHERE c_id=$1::int AND p_id=$2::int;";
      await client.query( sql, [ c_id, p_id ] );
      debug( "delP : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "delP : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async delUser( c_id, user_id ) {
    debug( "Delete an user to a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "DELETE FROM UserCourse WHERE p_id=$1::int AND user_id=$2::int;";
      await client.query( sql, [ c_id, user_id ] );
      debug( "delUser : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "delUser : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async readCourseUser( user_id ) {
    debug( "Read all course for a user" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT c_id FROM UserCourse WHERE user_id = $1::int;";
      const tabCourse = await client.query( sql, [ user_id ] );
      debug( "readCourseUser : SUCCESS" );
      return tabCourse.rows;
    } catch ( err ) {
      debug( "readCourseUser : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }

  static async readUserReg( c_id ) {
    debug( "Read all user registered for a course" );
    const client = await ModelDB.connect_to_db();
    try {
      const sql = "SELECT user_id FROM UserCourse WHERE p_id = $1::int";
      const res = await client.query( sql, [ c_id ] );
      debug( "readUserReg : SUCCESS" );
      return res.rows;
    } catch ( err ) {
      debug( "readUserReg : " + err.stack );
      return false;
    } finally {
      client.end();
    }
  }
}

ModelCourse.dbName = "Course";
ModelCourse.keys = [
  [ "c_id", "int" ],
  [ "name", "varchar" ],
  [ "available", "boolean" ],
  [ "description", "text" ]
];
ModelCourse.locKey = undefined;

module.exports = ModelCourse;
