var express = require("express");
var router = express.Router();

const accessControl = require("../middlewares/accessControl");
const connection = accessControl.checkConnection;
const roleControl = require("../middlewares/checkRole");
const role = roleControl.checkRole;

const ControllerPlageUserAPI = require("../controller/ControllerPlageUserAPI");

const auth = require('../middlewares/auth')

// !!! TO DO: add connection and role requirements when needed for routes below
// For instance, create user should only be possible for admin users

const debug = require("debug")("userRoutes");




// This route is for authenticating the user
// (data coming from the login page)

// ========== API v2 ==========

// Log in a user
router.post("/api/user/login",function (req, res) {
  ControllerPlageUserAPI.login(req, res);
});

router.get("/api/auth/verify", function(req, res) {
  ControllerPlageUserAPI.verify(req, res)
})
// Create new user
router.post("/api/user", function (req, res) {
  ControllerPlageUserAPI.create(req, res);
});

// Log out a user
router.delete("/api/user/logout", function (req, res) {
  ControllerPlageUserAPI.logout(req, res);
});

// Get all users
router.get("/api/users", connection, role("Administrateur"), function (req, res) {
  debug("calling ControllerPlageUserAPI.readAll")
  ControllerPlageUserAPI.readAll(req, res);
});

// Get a user
router.get("/api/user/:userId", connection, function (req, res) {
  ControllerPlageUserAPI.read(req, res);
});

router.get("/api/user/:userId/skills", connection, function (req, res) {
  ControllerPlageUserAPI.getSkills(req, res);
});

// Update user
router.put("/api/user/:userId", connection, role("Administrateur"), function (req, res) {
  ControllerPlageUserAPI.update(req, res);
});

// ASKS for a password reset
router.post("/api/user/password", function (req, res) {
  ControllerPlageUserAPI.requestPasswordReset(req, res);
});

// Password reset
router.put("/api/user/password/:nonce", function (req, res) {
  ControllerPlageUserAPI.resetPassword(req, res);
});

// User account activation
router.post("/api/user/activate/:nonce", function (req, res) {
  ControllerPlageUserAPI.activate(req, res);
});

// Delete user
router.delete("/api/user/:userId", connection, role("Administrateur"), function (req, res) {
  ControllerPlageUserAPI.delete(req, res); //fonction à faire dans le controller
});

// Update user's profile
router.put("/api/user/:userId/profile", auth.isAuth ,function (req, res) {
  ControllerPlageUserAPI.updateProfile(req, res);
});



module.exports = router;
