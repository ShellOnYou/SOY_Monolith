"use strict";
const Model = require( "./Model" );

class ModelLMSContent extends Model {

  // Constructor
  constructor( data ) {
    super();
    this.lmsc_id = data.lmsc_id;
    this.name = data.name;
    this.description = data.description;
    this.url = data.url;
    this.act_code = data.act_code;

    this.dbName = ModelLMSContent.dbName;
    this.keys = ModelLMSContent.keys;
    this.locKey = ModelLMSContent.locKey;
  }
}

ModelLMSContent.dbName = "LMSContent";
ModelLMSContent.keys = [
  [ "lmsc_id", "int" ],
  [ "name", "varchar" ],
  [ "description", "text" ],
  [ "url", "varchar" ],
  [ "act_code", "varchar" ]
];
ModelLMSContent.locKey = undefined;

module.exports = ModelLMSContent;
