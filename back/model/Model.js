"use strict";
const ModelDB = require( "./ModelDB" );
const debug = require( "debug" )( "Model" );


class Model {

  // Create
  async save() {
    debug( "save" );
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const keyList = new Array();
      const sqlValues = new Array();
      const values = new Array();

      //debug("Keys: "+this.keys)

      for ( let i = 1; i < this.keys.length; i++ ) {
        keyList.push( this.keys[ i ][ 0 ] );
        values.push( this[ this.keys[ i ][ 0 ] ] );
        sqlValues.push( "$" + i + "::" + this.keys[ i ][ 1 ] );
      }

      if ( this[ this.keys[ 0 ][ 0 ] ] != undefined ) {
        keyList.push( this.keys[ 0 ][ 0 ] );
        values.push( this[ this.keys[ 0 ][ 0 ] ] );
        sqlValues.push( "$" + ( sqlValues.length + 1 ) + "::" + this.keys[ 0 ][ 1 ] );
      }
      
      let sql = "INSERT INTO " + this.dbName + " (" + keyList.join( ", " );
      sql += ") VALUES (" + sqlValues.join( ", " ) + ") RETURNING " + this.keys[ 0 ][ 0 ] + ";";

      //debug("SQL : "+sql)
      //debug("VALUES : "+values)

      const res = await client.query( sql, values );
      return res.rows[ 0 ][ this.keys[ 0 ][ 0 ] ];
    } catch ( err ) {
      debug( "save : " + err.stack );
      return false;
    } finally {
      debug("Releasing client from DB pool used to save a Model object")
      client.release();
    }
  }

  // Read All
  static async readAll() {
    debug( "readAll ( "+this.dbName+')');
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM " + this.dbName + ";";
      const tab = await client.query( sql );
      debug( "readAll: SUCCESS" );
      return tab.rows;
    } catch ( err ) {
      debug( "readAll: " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }

  // Read matching locale
  static async readJustLoc( locale ) {
    debug( "readJustLoc" );
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM " + this.dbName + " WHERE locale=$1::loc;";
      const tab = await client.query( sql, [ locale ] );
      debug( "readJustLoc = SUCCESS" );
      return tab.rows;
    } catch ( err ) {
      debug( "readJustLoc : " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }

  static async readAllLoc( locale ) {
    debug( "readAllLoc" );
    const tabEn = await this.readJustLoc( "en" );
    if ( !tabEn ) {
      debug("I could read ENglish rows")
      return false;
    }
    const tabLoc = await this.readJustLoc( locale );
    if ( !tabLoc ) {
      return false;
    }

    debug( "removing ENglish entries for which we have an equivalent locale version")
    
   
    // AN IMPROVED VERSION
    const tabEnKeys = tabEn.map(entry => entry[ this.keys[ 0 ][ 0 ] ]);
    const tabLocKeys = tabLoc.map(entry2 => entry2[this.locKey]);
    const intersection = tabEnKeys.filter(element => tabLocKeys.includes(element));
    const filteredTabEn = tabEn.filter(elem => ! intersection.includes(elem[ this.keys[ 0 ][ 0 ] ]))    

    return tabLoc.concat( filteredTabEn );
  }

  // Read with id
  static async read( id ) {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "SELECT * FROM " + this.dbName + " WHERE " + this.keys[ 0 ][ 0 ] + " = $1;";
      //debug("SQL REQ: "+sql)
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

  // Update
  async update() {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      let sql = "UPDATE " + this.dbName + " SET ";
      const values = new Array();
      for ( let i = 1; i < this.keys.length; i++ ) {
        sql += this.keys[ i ][ 0 ] + " = $" + i;
        values.push( this[ this.keys[ i ][ 0 ] ] );
        if ( i != this.keys.length - 1 ) {
          sql += ", ";
        }
      }
      values.push( this[ this.keys[ 0 ][ 0 ] ] );
      sql += " WHERE " + this.keys[ 0 ][ 0 ] + " = $" + this.keys.length;
      await client.query( sql, values );
      debug( "update : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "update : " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }

  // Delete
  static async delete( id ) {
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "DELETE FROM " + this.dbName + " WHERE " + this.keys[ 0 ][ 0 ] + " = $1;";
      await client.query( sql, [ id ] );
      debug( "delete : SUCCESS " );
      return true;
    } catch ( err ) {
      debug( "delete : : " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }

  // Set the id as ref_id, be sure the object need a ref_id
  static async refSelf( id ) {
    debug( "Reference self" );
    const client = await ModelDB.connect_to_db_from_pool();
    try {
      const sql = "UPDATE " + this.dbName + " SET ref_id = $1::int WHERE " + this.keys[ 0 ][ 0 ] + " = $1::int;";
      await client.query( sql, [ id ] );
      debug( "refSelf : SUCCESS" );
      return true;
    } catch ( err ) {
      debug( "refSelf : " + err.stack );
      return false;
    } finally {
      client.release();
    }
  }
}

module.exports = Model;

