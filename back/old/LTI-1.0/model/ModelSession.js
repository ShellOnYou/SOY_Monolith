// PlageConnect file
// not connected to the database at the moment

const uuid = require( "uuid/v1" );

const debug = require("debug")("ModelSession");

class Session {
  constructor( id, token ) {
    this.id = id;
    this.token = token;
  }
}

class Sessions {
  constructor() {
    this.sessionList = [];
    this.connect = this.connect.bind( this );
  }

  isConnected( id, token ) {
    return !!this.sessionList.find( s => s.id == id && s.token == token );
  }

  connect( id ) {
    const token = uuid();
    this.sessionList.push( new Session( id, token ) );
    return token;
  }

  disconnect( id, token ) {
    this.sessionList = this.sessionList.filter( s => s.id != id && s.token != token );
    debug("SessionList is now"+this.sessionList)
  }
}

module.exports = new Sessions();
