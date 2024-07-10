var express = require("express");
var router = express.Router();

const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const ControllerProfileAPI = require("../controller/ControllerProfileAPI");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;

const debug = require("debug")("profile");

// ============ API 2 ==========
// API create a profile
router.post(
  "/api/business-profile",
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerProfileAPI.create(req, res);
  }
);

// API update a profile
router.put(
  "/api/business-profile/:profileId",
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerProfileAPI.update(req, res);
  }
);

// API delete a profile
router.delete(
  "/api/business-profile/:profileId",
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerProfileAPI.delete(req, res); //TODO
  }
);

// API get a profile
router.get("/api/business-profile/:profileId", function (req, res) {
  debug("on passe dans la route /api/business-profile/{profileId}");
  ControllerProfileAPI.read(req, res);
});

// API get all Profiles
router.get("/api/business-profiles", function (req, res) {
  ControllerProfileAPI.readAll(req, res);
});
module.exports = router;
