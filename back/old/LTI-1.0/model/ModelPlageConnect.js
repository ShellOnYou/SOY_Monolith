


const ConfPlageConnect = require( "../config/ConfPlageConnect" );
const request = require( "request" );
const ModelUsers = require( "./ModelUser" );
const ModelSessions = require( "./ModelSession" );
const debug = require( "debug" )( "ModelPlageConnect" );

module.exports.MoodleToken = async function( req, res ) {
  let urlMoodleToken = ConfPlageConnect.MoodleHost + "/login/token.php?username=" + ConfPlageConnect.MoodleAuth;
  urlMoodleToken += "&password=" + ConfPlageConnect.MoodlePwd + "&service=" + ConfPlageConnect.MoodleService;
  request.post( urlMoodleToken, null,
    ( error, response1, body ) => {
      if ( error ) {
        console.error( error );
        return;
      }
      if ( response1.statusCode === 200 ) {
        const url = ConfPlageConnect.MoodleHost + "/webservice/rest/server.php?wstoken=" +
                    ConfPlageConnect.MoodleTokenWeb + "&wsfunction=auth_userkey_request_login_url&moodlewsrestformat=json&user[email]=" + req.body.id;
        request.post( url, null, ( error, response2, body ) => {
          if ( error ) {
            console.error( error );
            return;
          }
          res.data = body;
          if ( response2.statusCode === 200 ) {
            res.writeHead( 200, { "Content-Type": "application/json" } );
            res.end( JSON.stringify( res.data ) );
          } else {
            res.writeHead( 401, { "Content-Type": "application/json" } );
            res.end();
          }
        } );
      }
    } );
};

module.exports.login = async function( req, res ) {
  const id = req.body.id;
  const pwd = req.body.pwd;
  debug( "id="+id+ " pwd=" + pwd);
  if ( ModelUsers.findByLogin( id, pwd ) ) {
    const token = ModelSessions.connect( id );
    debug( id + " just logged in with token " + token );

    const data = { token: token, userId: id };

    res.data = data; // peut-être inutile ?

  
    res.send( JSON.stringify( data ) );

  } else {
    debug( "Error connection" );
    res.writeHead( 401, { "Content-Type": "application/json" } );
    res.end();
  }
};

module.exports.logout = async function( req, res ) {
  const id = req.body.id;
  const token = req.body.token;
  ModelSessions.disconnect( id, token );
  console.log( id + " logged out" );
  res.writeHead( 200 );
  res.end();
};
