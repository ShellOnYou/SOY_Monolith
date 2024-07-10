var express = require("express");
var router = express.Router();
const debug = require( "debug" )( "exercises" );
const ControllerExerciseAPI = require('../controller/ControllerExerciseAPI')

const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;

async function debugMiddleWareExercise(req, res, next) {
    debug("\n\ndebug Middle EXERCISE\n\n")
    debug("session :: "+JSON.stringify(req.session))
    next()
  }

// ============ API 2 ==========

//Create an exercise
router.post("/api/exercise", connection, role("Enseignant"), function (req, res) {
  ControllerExerciseAPI.create(req, res);
});

//Get all exercises
router.get("/api/exercises", connection, role("Enseignant"), function (req, res) {
  ControllerExerciseAPI.readAll(req, res);
});

//Get one exercise
router.get("/api/exercise/:exerciseId", function (req, res) {
  ControllerExerciseAPI.read(req, res);
});

//Update one exercise
router.put(
  "/api/exercise/:exerciseId",
  connection,
  role("Enseignant"),
  function (req, res) {
    ControllerExerciseAPI.update(req, res);
  }
);

//Delete one exercise
router.delete("/api/exercise/:exerciseId", connection, role("Enseignant"), function (req, res) {
  ControllerExerciseAPI.delete(req, res);
});

module.exports = router;
