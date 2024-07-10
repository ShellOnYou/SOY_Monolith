var express = require("express");
var router = express.Router();

const accessControl = require("../middlewares/accessControl");
const roleControl = require("../middlewares/checkRole");
const ControllerAdmin = require("../controller/ControllerAdmin");
const { nextTick } = require("async");
const connection = accessControl.checkConnection;
const role = roleControl.checkRole;
const debug = require('debug')('admin')


// ========= API ========== Micro-services =====

/* NOT IMPLEMENTED
  router.get("/API/users/roles", connection, role("Administrateur"), function (req, res) {
  ControllerAdmin.getAllUsersAPI(req, res);
}); */

router.put(
  "/API/role/:role_id/:user_id",
  connection,
  role("Administrateur"),
  function (req, res) {
    ControllerAdmin.updateRoleAPI(req, res);
  }
);

module.exports = router;
