const ModelPlageUser = require( "../model/ModelPlageUser" );
const debug = require( "debug" )( "accessControl" );
const auth = require("./auth")

module.exports = {
    checkConnection: async function( req, res, next ) {
        

        auth.isAuth(req, res, next)
    }
};
