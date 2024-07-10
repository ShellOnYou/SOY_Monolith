var express = require("express");
var router = express.Router();

const ControllerExerciseProductionAPI = require("../controller/ControllerExerciseProductionAPI");
const debug = require( "debug" )( "exercises" );

const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const auth = require("../middlewares/auth");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;

// ==================== API2 ====================
//TODO : Test POST route & generate & evaluate (all the other routes are OK)

//Create a new exercise production
router.post("/api/exercise-production", auth.isAuth, connection, function (req, res) {
  ControllerExerciseProductionAPI.create(req, res);
});

//Retrieve a specific exercise production
router.get(
  "/api/exercise-production/:exerciseProductionId",
  connection,
  function (req, res) {
    ControllerExerciseProductionAPI.read(req, res);
  }
);

//Deletes an exercise production
router.delete(
  "/api/exercise-production/:exerciseProductionId",
  connection,
  role("Enseignant"),
  function (req, res) {
    ControllerExerciseProductionAPI.delete(req, res);
  }
);

//Retrieve all exercise productions submitted by a student
router.get("/api/exercise-productions/student/:userId",
  connection, function (req, res) {
  ControllerExerciseProductionAPI.readStudentExerciseProductions(req, res);
});

// Get all exercise productions related to an exercise
router.get(
  "/api/exercise-productions/exercise/:exerciseId",
  connection,
  role("Enseignant"),
  function (req, res) {
    ControllerExerciseProductionAPI.readExerciseExerciseProductions(req, res);
  }
);

//Get all exercise productions submitted by a student and related to an exercise
router.get(
  "/api/exercise-productions/user/:userId/exercise/:exerciseId",
  connection,
  function (req, res) {
    ControllerExerciseProductionAPI.readExerciseStudentExerciseProductions(req, res);
  }
);


router.post("/api/exercise-production/evaluate",
   connection, function (req, res) {
  ControllerExerciseProductionAPI.evaluate(req, res);
});

//Creates a student statement (but only statement + archive) given an exercise id
router.get(
  "/api/exercise-production/exercise/:exerciseId/generate-statement",
connection, function (req, res) {
    ControllerExerciseProductionAPI.generateStatement(req, res);});


module.exports = router;
