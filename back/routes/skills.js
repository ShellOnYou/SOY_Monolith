const debug = require( "debug" )( "skills" );
var express = require("express");
var router = express.Router();

const ControllerSkillAPI = require("../controller/ControllerSkillAPI");

const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;

// ========== API 2 ==========

//   ---------------------- SKILLS FOR AN EXERCISE ---------------------
// Get skill list for one exercise (by locale if specified)
router.get("/api/exercise/:exerciseId/skills", function (req, res) {
  ControllerSkillAPI.readAllByEx(req, res);
});

// TO DO: routes below should be available only with teacher or admin roles !

// Add an array of skills to an exercise
router.post(
  "/api/exercise/:exerciseId/skills",
  connection,         
  role("Administrateur"),  
  function (req, res) {
    ControllerSkillAPI.createAllByEx(req, res);
  }
);

// Update skills for one exercise (by locale if specified)
router.put(
  "/api/exercise/:exerciseId/skills",
  connection,  //<-- IS THIS WORKING (seing instructor as connected)?
  role("Administrateur"), //<-- IS THIS WORKING (seing instructor as connected)?
  function (req, res) {
    ControllerSkillAPI.updateAllSkillsByEx(req, res);
  }
);

// Delete all skills for an exercise
router.delete(
  "/api/exercise/:exerciseId/skills",
  connection,          // <- working
  role("Administrateur"),  // <- working also
  function (req, res) {
    ControllerSkillAPI.deleteAllExerciseLevelByEx(req, res);
  }
);

//   ---------------------- BASIC SET OF SKILLS ---------------------

// Get skills by locale
router.get("/api/skills", function (req, res) {
  debug("Asked to give skills for a locale")
  ControllerSkillAPI.readAllByLocale(req, res);
});

// Create a skill
router.post(
  "/api/skill", 
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerSkillAPI.create(req, res);
  }
);

// Get a skill
router.get("/api/skill/:skillCode", function (req, res) {
  ControllerSkillAPI.read(req, res);
});

// // Update a skill
router.put(
  "/api/skill/:skillCode",
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerSkillAPI.update(req, res);
  }
);

// Delete a skill
router.delete(
  "/api/skill/:skillCode",
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerSkillAPI.delete(req, res);
  }
);

module.exports = router;
