const debug = require( "debug" )( "ControllerExercise" );

module.exports.login = async function( req, res ) {
  debug( "Sending login form" );

  res.render( "PlageConnect/login", {
    locale: req.i18n.getLocale(),
    pageTitle: "Login"
  } );
};
