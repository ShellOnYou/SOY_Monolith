const debug = require( "debug" )( "ControllerLMSLogging" );
const ModelLMSLogging = require( "../model/ModelLMSLogging" );

module.exports.created = async function( req, res ) {
  debug( "Create new entry LMSLogging" );
  const lmsl = new ModelLMSLogging( req.body );

  const success = await lmsl.save();
  if ( success ) {
    res.status( 200 ).end( JSON.stringify( {
      message: "SUCCESS ID : " + success,
      id: success
    } ) );
  } else {
    res.status( 500 ).end();
  }
};

module.exports.read = async function( req, res ) {
  debug( "Read on entry" );
  const entry = await ModelLMSLogging.read( req.params.id );
  if ( entry ) {
    res.status( 200 ).end( JSON.stringify( entry ) );
  } else {
    res.status( 500 ).end();
  }
};
