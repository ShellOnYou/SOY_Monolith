"use strict";
const debug = require( "debug" )( "ModelFile" );

class ModelFile {
  constructor( data ) {
    debug( "Creation d'un objet" );
    this.name = data.name;
    this.data = data.data;
    this.size = data.size;
    this.md5 = data.md5;
  }
}

module.exports = ModelFile;
