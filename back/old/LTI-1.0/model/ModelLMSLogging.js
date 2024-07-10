"use strict";
const Model = require( "./Model" );

class ModelLMSLogging extends Model {

  // Constructor
  constructor( data ) {
    super();
    this.lmsl_id = data.lmsl_id;
    this.user_id = data.user_id;
    this.duration = data.duration;
    this.consult_date = data.consult_date;
    this.content_rating = data.consult_date;
    this.comment = data.comment;
    this.lmsc_id = data.lmsc_id;

    this.dbName = ModelLMSLogging.dbName;
    this.keys = ModelLMSLogging.keys;
    this.locKey = ModelLMSLogging.locKey;
  }
}

ModelLMSLogging.dbName = "LMSLogging";
ModelLMSLogging.keys = [
  [ "lmsl_id", "int" ],
  [ "user_id", "int" ],
  [ "duration", "varchar" ],
  [ "consult_date", "date" ],
  [ "content_rating", "varchar" ],
  [ "comment", "text" ],
  [ "lmsc_id", "int" ]
];
ModelLMSLogging.locKey = undefined;

module.exports = ModelLMSLogging;
