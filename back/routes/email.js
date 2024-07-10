var express = require("express");
var router = express.Router();
//const ConfServ = require("../config/ConfServ");
const ControllerMail = require("../controller/ControllerMail");
const debug = require("debug")("email");

router.post("/api/email", function (req, res) {
  let key = req.body.key;
  if (key ==   process.env.EMAIL_INTERNAL_API_KEY) {
  //if (key == ConfServ.key) {
    ControllerMail.send_mail(req, res);
  } else {
    res.status(401).end()
  }
});


module.exports = router;
