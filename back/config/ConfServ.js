const debug = require("debug")("ConfServ");
// Webserver URL
if ( process.env.PLAGE_ENV != undefined ) {
  module.exports.servURL = process.env.PLAGE_ENV;
} else {
  debug( "PLAGE_ENV environment variable not set. The Node process will be stopped." );
  process.exit( -1 );
}


