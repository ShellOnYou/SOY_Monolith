
const debug = require("debug")("ModelDB");
const ConfDB = require( "../config/ConfDB.js" );
 
const { Pool } = require('pg');
const pool = new Pool(ConfDB);

pool.on('error', (err, client) => {
  debug('Unexpected error when trying to create a pool to connect to Postgres DB server: ', err)
});

module.exports = {
  connect_to_db: function() {
    const { Client } = require( "pg" );
    var client = new Client( ConfDB );
    client.connect();
    return client;
  },

  connect_to_db_from_pool: function() {
    return pool.connect();
  },

  disconnect_from_db_through_pool: function() {
    pool.end();
  }
};

