var express = require("express");
var router = express.Router();
const debug = require("debug")("studentStatement");
const ControllerStudentStatementAPI = require("../controller/ControllerStudentStatementAPI");

const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;

// ========== API 2 ==========

router.post("/api/student-statement", function (req, res) {
  ControllerStudentStatementAPI.create(req, res);
});

router.get(
  "/api/student-statement/user/:userId/exercise/:exerciseId/business-session/:businessSessionId",
  function (req, res) {
    ControllerStudentStatementAPI.read(req, res);
  }
);

router.put(
  "/api/student-statement/user/:userId/exercise/:exerciseId/business-session/:businessSessionId",
  function (req, res) {
    ControllerStudentStatementAPI.update(req, res);
  }
);

module.exports = router;
