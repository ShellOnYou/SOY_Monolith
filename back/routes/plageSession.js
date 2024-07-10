var express = require( "express" );
var router = express.Router();
const ControllerPlageSessionAPI = require( "../controller/ControllerPlageSessionAPI" );
const debug = require( "debug" )( "plageSession" );
const accessControl = require( "../middlewares/accessControl" );
const connection = accessControl.checkConnection;
const roleControl = require( "../middlewares/checkRole" );
const role = roleControl.checkRole;

// ========== API 2 ==========

// Read all sessions

router.get( "/api/business-sessions", connection, function( req, res ) {
  ControllerPlageSessionAPI.readAll( req, res );
} );

//Quit a session

router.delete( "/api/business-session/quit", connection, function( req, res ) {
  ControllerPlageSessionAPI.quitSession( req, res );
} );

// Read one session

router.get( "/api/business-session/:sessionId", connection, function( req, res ) {
  ControllerPlageSessionAPI.read( req, res );
} );

// Read one session

router.get( "/api/business-session/:sessionId/stats", connection, role("Enseignant"), function( req, res ) {
  ControllerPlageSessionAPI.getStats( req, res );
} );

// Create a session

router.post( "/api/business-session", connection, role( "Enseignant" ), function( req, res ) {
  ControllerPlageSessionAPI.create( req, res );
} );

// Update a session

router.put( "/api/business-session/:sessionId", connection, role( "Enseignant" ), function( req, res ) {
  ControllerPlageSessionAPI.update( req, res );
} );

// Delete a session

router.delete( "/api/business-session/:sessionId", connection, role( "Enseignant" ), function( req, res ) {
  ControllerPlageSessionAPI.delete( req, res );
} );

// Get all sessions for a given user

router.get( "/api/user/:userId/business-sessions", connection, function( req, res ) {
  ControllerPlageSessionAPI.readForUser( req, res );
} );

router.get( "/api/business-sessions/user/:userId/available", connection, function( req, res ) {
  ControllerPlageSessionAPI.readAvailable( req, res );
} );

// Get all exercises for a given session

router.get( "/api/business-session/:sessionId/exercises", connection, function( req, res ) {
  ControllerPlageSessionAPI.getExercisesForSession( req, res );
} );

//Register to a session for

router.post( "/api/business-session/register", connection, function( req, res ) {
  ControllerPlageSessionAPI.registerToSession( req, res );
} );

router.get( "/api/business-session/:sessionId/registered", connection, function( req, res ) {
  ControllerPlageSessionAPI.registeredCount( req, res );
} );

//Get all exercise production for a user and a session

router.get(
  "/api/business-session/:sessionId/user/:userId/exercise-productions",
  connection,
  function( req, res ) {
    ControllerPlageSessionAPI.getExerciseProductionForStudentSession( req, res );
  }
);

module.exports = router;
