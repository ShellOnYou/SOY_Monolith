"use strict";
const debug = require( "debug" )( "ModelProfile" );
const Model = require( "./Model" );

class ModelProfile extends Model {

  // Constructor
  constructor( data ) {
    super();
    this.p_id = data.p_id;
    this.job = data.job;
    this.level = data.level;
    this.sector = data.sector;
    this.description = data.description;
    this.ref_id = data.ref_id;
    this.locale = data.locale;

    this.dbName = ModelProfile.dbName;
    this.keys = ModelProfile.keys;
    this.locKey = ModelProfile.locKey;
  }
}

ModelProfile.dbName = "Profile";
ModelProfile.keys = [
  [ "p_id", "int" ],
  [ "job", "varchar" ],
  [ "level", "varchar" ],
  [ "sector", "varchar" ],
  [ "description", "text" ],
  [ "ref_id", "int" ],
  [ "locale", "loc" ]
];
ModelProfile.locKey = "ref_id";

module.exports = ModelProfile;
