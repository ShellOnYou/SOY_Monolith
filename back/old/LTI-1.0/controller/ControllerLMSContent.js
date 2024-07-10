const debug = require( "debug" )( "ControllerLMSContent" );
const ModelLMSContent = require( "../model/ModelLMSContent" );

module.exports.created = async function( req, res ) {
  debug( "Create new LMS Content" );
  const lmsc = new ModelLMSContent( req.body );

  const success = await lmsc.save();
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
  debug( "Read a content" );
  const entry = await ModelLMSContent.read( req.params.lmsl_id );
  if ( entry ) {
    res.status( 200 ).end( JSON.stringify( entry ) );
  } else {
    res.status( 500 ).end();
  }
};
