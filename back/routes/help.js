var express = require('express');
var router = express.Router();
const debug = require( "debug" )( "help" );
const accessControl = require('../middlewares/accessControl')
const roleControl = require('../middlewares/checkRole')
const connection = accessControl.checkConnection
const role = roleControl.checkRole
const ControllerHelp = require("../controller/ControllerHelp")


router.get('/api/help/list', connection,  function (req, res) {
  debug("route for obtaining help")
  ControllerHelp.list(req, res)
})


module.exports = router;