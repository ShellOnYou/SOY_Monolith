const debug = require( "debug" )( "sequence" );
var express = require("express");
var router = express.Router();

const ControllerSequenceAPI = require("../controller/ControllerSequenceAPI");
const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;

// ==================== API v2 ====================
// Create a new sequence
router.post("/api/sequence", connection, role("Enseignant"), function (req, res) {
  ControllerSequenceAPI.create(req, res);
});

// Retrieve all sequences
router.get("/api/sequences", connection, role("Enseignant"), function (req, res) {
  ControllerSequenceAPI.readAll(req, res);
});

// Get one sequence given its id
router.get(
  "/api/sequence/:sequenceId",
  /* connection, */ function (req, res) {
    ControllerSequenceAPI.read(req, res);
  }
);

// Update a sequence given its id
router.put("/api/sequence/:sequenceId", connection, role("Enseignant"), function (req, res) {
  ControllerSequenceAPI.update(req, res);
});

// Delete a sequence given its id
router.delete("/api/sequence/:sequenceId", connection, role("Enseignant"), function (req, res) {
  ControllerSequenceAPI.delete(req, res);
});

// Get all exercises from a sequence
router.get("/api/sequence/:sequenceId/exercises", connection, function (req, res) {
  ControllerSequenceAPI.readAllSequenceExercises(req, res);
});

module.exports = router;
