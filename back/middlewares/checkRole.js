const ModelPlageUser = require( "../model/ModelPlageUser" );
const debug = require( "debug" )( "checkRole" );

const roleOrder = new Map( [
    [ "etudiant", "1" ],
    [ "Enseignant", "2" ],
    [ "Administrateur", "3" ]
  ] );

module.exports = {
    checkRole: function( expectedRole ) {
        return async function( req, res, next ) {

            let id = req.session.user_id
            debug("you're id is "+id)
            let role = await ModelPlageUser.getUserRole(id)
            debug("Your role is: "+role)
            if (role === expectedRole || roleOrder.get(expectedRole) < roleOrder.get(role)) {
                debug('Access granted')
                next()
            } else {
                debug("You're not allowed to access that route with your role")
                // res.render('Error/403')
                res.status(403)
                res.end();
            }
        };
    }
};
